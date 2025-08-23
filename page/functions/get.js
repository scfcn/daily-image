export async function onRequest(context) {
  const { request, env, next } = context;
  
  try {
    // 调用EdgeOne Pages的资产API获取/picture目录下的所有文件
    // 注意：_assets是EdgeOne提供的内置对象，用于访问项目资产
    const pictureDir = await env._assets.list({ prefix: 'picture/' });
    
    // 过滤出图片文件（可根据需要调整文件类型过滤）
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const pictures = pictureDir.objects
      .map(item => item.key)
      .filter(key => {
        const ext = key.split('.').pop().toLowerCase();
        return imageExtensions.includes(ext);
      });
    
    if (pictures.length === 0) {
      return new Response('No pictures found in /picture directory', { status: 404 });
    }
    
    // 随机选择一张图片
    const randomIndex = Math.floor(Math.random() * pictures.length);
    const randomPicture = pictures[randomIndex];
    
    // 构建重定向URL（确保路径正确）
    const redirectUrl = `/${randomPicture}`;
    
    // 返回302重定向响应
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl
      }
    });
  } catch (error) {
    console.error('Error fetching pictures:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
