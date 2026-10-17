import urllib.request,urllib.parse,concurrent.futures,pathlib,json,sys
from bs4 import BeautifulSoup
p=pathlib.Path(__file__).parent
def fetch(z):
 n,u=z
 try:
  with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=22) as r:b=r.read();ct=r.headers.get('Content-Type','');actual=r.url
  ext='.json' if 'json' in ct else '.pdf' if b[:4]==b'%PDF' else '.xlsx' if b[:2]==b'PK' else '.html'
  (p/(n+ext)).write_bytes(b)
  if ext in ['.html','.json']:
   s=BeautifulSoup(b,'html.parser');t=s.get_text(' ',strip=True);(p/(n+'.txt')).write_text(t,encoding='utf8')
  else:t='binary'
  return {'name':n,'url':actual,'bytes':len(b),'file':n+ext,'text':t[:1400]}
 except Exception as e:return {'name':n,'url':u,'error':str(e)}
jobs=json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf8'))
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
 for f in concurrent.futures.as_completed([ex.submit(fetch,z) for z in jobs]):
  r=f.result();results.append(r);print(json.dumps(r,ensure_ascii=False),flush=True)
(p/(pathlib.Path(sys.argv[1]).stem+'-results.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
