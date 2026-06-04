import { createServerClient } from '@/lib/supabase'

type AppKeyRow = { user_id: string }

const JS_TEMPLATE = `(function(){
  window.unchurnly=window.unchurnly||{};
  window.unchurnly.appKey='__APP_KEY__';
  window.unchurnly.apiBase='__API_BASE__';
  window.unchurnly.init=function(action,config){
    if(action!=='show')return;
    var o=document.createElement('div');
    o.id='unchurnly-overlay';
    o.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;';
    var f=document.createElement('iframe');
    f.style.cssText='width:480px;max-width:95vw;height:600px;border:none;border-radius:12px;background:white;';
    f.src=window.unchurnly.apiBase+'/cancel-flow?key='+encodeURIComponent(window.unchurnly.appKey)+'&customerId='+encodeURIComponent(config.customerId)+'&authHash='+encodeURIComponent(config.authHash);
    o.appendChild(f);document.body.appendChild(o);
    fetch(window.unchurnly.apiBase+'/api/widget',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appKey:window.unchurnly.appKey})}).catch(function(){});
    o.addEventListener('click',function(e){if(e.target===o)document.body.removeChild(o);});
    window.addEventListener('message',function(e){if(e.data==='unchurnly:close'){var el=document.getElementById('unchurnly-overlay');if(el&&el.parentNode)el.parentNode.removeChild(el);}});
  };
})();`

export async function GET(request: Request) {
  const appKey = new URL(request.url).searchParams.get('key')

  if (!appKey) {
    return new Response('Not found', { status: 404 })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('founder_app_keys')
    .select('app_key')
    .eq('app_key', appKey)
    .maybeSingle()

  if (!data) {
    return new Response('Not found', { status: 404 })
  }

  const apiBase = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const js = JS_TEMPLATE.replace('__APP_KEY__', appKey).replace('__API_BASE__', apiBase)

  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const appKey =
    body !== null && typeof body === 'object'
      ? (body as Record<string, unknown>).appKey
      : undefined

  if (typeof appKey !== 'string' || !appKey) {
    return new Response('Bad Request', { status: 400 })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('founder_app_keys')
    .select('user_id')
    .eq('app_key', appKey)
    .maybeSingle()

  if (!data) {
    // Return 200 to not leak whether key exists
    return new Response(null, { status: 200 })
  }

  const { user_id } = data as AppKeyRow

  await supabase.from('widget_impressions').insert({ user_id })

  const { data: userRow } = await supabase
    .from('users')
    .select('widget_installed')
    .eq('id', user_id)
    .single()

  if (userRow && !userRow.widget_installed) {
    await supabase
      .from('users')
      .update({ widget_installed: true, widget_first_seen_at: new Date().toISOString() })
      .eq('id', user_id)
  }

  return new Response(null, { status: 200 })
}
