# Recomprime as imagens de um PDF em JPEG para caber em limites de upload (ex.: 49 MiB).
#   python scripts/comprimir-pdf.py docs/2000-projetos-de-marcenaria.pdf docs/2000-projetos-de-marcenaria-49mb.pdf 80
import os, sys
from pypdf import PdfReader, PdfWriter
from PIL import Image

ent, sai = sys.argv[1], sys.argv[2]
q = int(sys.argv[3]) if len(sys.argv) > 3 else 80
w = PdfWriter(clone_from=PdfReader(ent))
n = 0
for page in w.pages:
    for img in page.images:
        im = img.image
        if im.mode in ("RGBA", "LA", "P"):
            fundo = Image.new("RGB", im.size, (255, 255, 255))
            fundo.paste(im, mask=im.convert("RGBA").split()[-1])
            im = fundo
        img.replace(im.convert("RGB"), quality=q)
        n += 1
w.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
with open(sai, "wb") as f:
    w.write(f)
mib = os.path.getsize(sai) / 1024 / 1024
print(f"{n} imagens, {len(w.pages)} páginas, {mib:.1f} MiB")
