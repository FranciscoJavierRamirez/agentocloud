---
id: seguridad
orden: 8
ancla: "seguridad"
prioridad: P1
tema: "oscuro"
titulo: "Su operación siempre bajo su control."
bajada: "Agento solo lee los datos que su planta ya registra. No envía comandos ni cambia parámetros, así que su operación funciona con total normalidad."
puntos:
  - titulo: "Solo lectura"
  - titulo: "Su equipo decide"
  - titulo: "Donde usted prefiera"
  - titulo: "Acceso controlado y trazable"
  - titulo: "Respuesta ante incidentes"
boton:
  texto: "Conversar sobre seguridad"
  ancla: "primer-paso"
esquema:
  nodos:
    control: "Sistema de control (PLC)"
    historiador: "Historiador o réplica en la DMZ"
    agento: "Agento"
    persona: "Persona que aprueba"
  flecha: "SOLO LECTURA"
  alt: "Esquema: Agento lee del historiador o de su réplica en un solo sentido y entrega la causa a una persona. No hay ninguna conexión de vuelta hacia el control."
imagen:
  codigo: "IMG-09"
  alt: "Sala de control de noche. Agento lee desde el historiador en un solo sentido y solo entrega información a una persona."
---

Seguridad por diseño. Agento se pone encima de lo que su operación ya tiene, sin abrir caminos hacia el control: lee en un solo sentido, desde el historiador o su réplica, y cada recomendación la aprueba una persona de su equipo. Tomamos como referencia la norma IEC 62443 y lo que la Ley Marco de Ciberseguridad (Ley 21.663) pide a los operadores de importancia vital. Antes de empezar, revisamos cada punto con su equipo de TI y ciberseguridad.
