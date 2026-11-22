---
id: seguridad
orden: 8
ancla: "security"
prioridad: P1
tema: "oscuro"
titulo: "Your operation, always under your control."
bajada: "Agento only reads the data your plant already records. It sends no commands and changes no parameters, so your operation keeps running completely as normal."
puntos:
  - titulo: "Read-only"
  - titulo: "Your team decides"
  - titulo: "Wherever you prefer"
  - titulo: "Controlled, traceable access"
  - titulo: "Incident response"
boton:
  texto: "Talk about security"
  ancla: "first-step"
esquema:
  nodos:
    control: "Control system (PLC)"
    historiador: "Historian or replica in the DMZ"
    agento: "Agento"
    persona: "Person who approves"
  flecha: "READ-ONLY"
  alt: "Diagram: Agento reads from the historian or its replica in one direction and delivers the cause to a person. There is no connection back to the control system."
imagen:
  codigo: "IMG-09"
  alt: "Control room at night. Agento reads from the historian in one direction and only delivers information to a person."
---

Secure by design. Agento sits on top of what your operation already has, without opening paths to the control system: it reads in one direction, from the historian or its replica, and every recommendation is approved by a person on your team. We take as reference the IEC 62443 standard and what Chile's Cybersecurity Framework Law (Law 21.663) requires of operators of vital importance. Before we start, we review each point with your IT and cybersecurity team.
