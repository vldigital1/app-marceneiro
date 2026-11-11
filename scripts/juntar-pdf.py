# Junta docs/_partes/*.pdf em docs/2000-projetos-de-marcenaria.pdf
#   python scripts/juntar-pdf.py
import glob, os
from pypdf import PdfWriter

partes = sorted(glob.glob(os.path.join("docs", "_partes", "*.pdf")))
w = PdfWriter()
for p in partes:
    w.append(p)
w.add_metadata({"/Title": "2.000 Projetos de Marcenaria — App do Marceneiro", "/Author": "App do Marceneiro"})
w.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
saida = os.path.join("docs", "2000-projetos-de-marcenaria.pdf")
with open(saida, "wb") as f:
    w.write(f)
print(saida, len(w.pages), "páginas", round(os.path.getsize(saida) / 1e6, 1), "MB")
