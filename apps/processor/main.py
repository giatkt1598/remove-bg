import io
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from PIL import Image
from rembg import new_session, remove

app = FastAPI(title='Remove BG Processor')
session = new_session('u2net')

@app.get('/health')
def health(): return {'status': 'ok', 'service': 'processor'}

@app.post('/remove')
async def remove_background(request: Request):
    data = await request.body()
    if not data: raise HTTPException(400, 'Empty image')
    try:
        output = remove(data, session=session)
        image = Image.open(io.BytesIO(output)).convert('RGBA')
        buffer = io.BytesIO(); image.save(buffer, format='PNG', optimize=True)
        return Response(buffer.getvalue(), media_type='image/png')
    except Exception as exc:
        raise HTTPException(422, 'Unable to process image') from exc
