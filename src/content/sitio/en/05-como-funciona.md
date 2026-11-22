---
id: como-funciona
orden: 5
ancla: "how-it-works"
prioridad: P1
titulo: "A twin that reasons, not just simulates."
pasos:
  - numero: 1
    titulo: "Projects"
  - numero: 2
    titulo: "Diagnoses"
  - numero: 3
    titulo: "Recommends"
  - numero: 4
    titulo: "Measures"
plano:
  nodos:
    control: "Control system (PLC)"
    historiador: "Historian or replica in the DMZ"
    agento: "Agento"
    persona: "Person who approves"
  flecha: "READ-ONLY"
  pie: "Illustrative diagram. Agento only reads: it never writes to the control system."
  alt: "Diagram: well, pump and tank run by the control system (PLC); the tank shows a gap. Agento reads from the historian or its replica in one direction and delivers the cause to a person who approves. There is no connection from Agento to the control system."
pilares:
  titulo: "Four principles"
  lista:
    - titulo: "Looks for causes, not just alarms"
    - titulo: "On top of what already exists"
    - titulo: "Secure by design"
    - titulo: "Verifiable savings"
imagen:
  codigo: "IMG-04"
  alt: "Inside a pumping station with three pumps. The twin flags that the middle pump uses 6.1% more energy per cubic meter: probable impeller wear."
capa_gemelo:
  rotulo: "B-02 · +6.1% KWH/M³ · PROBABLE IMPELLER WEAR"
---

The twin doesn't replace what you have: it sits on top, reads in read-only mode, and gives a person the cause, the evidence and what waiting costs.
