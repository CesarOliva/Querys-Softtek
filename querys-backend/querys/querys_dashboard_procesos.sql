use tiendita;

-- Vista con todos los datos de los empleados que repiten 

CREATE VIEW vista_empleados_tramposos AS
SELECT empleados.id, empleados.nombre, empleados.apellido, empleados.genero, empleados.edad, masaje.fecha AS fecha_masaje, spa.fecha AS fecha_spa
FROM empleados
INNER JOIN Masaje ON empleados.id = masaje.id_empleado
INNER JOIN Spa ON masaje.id_empleado = spa.id_empleado AND YEARWEEK(spa.fecha,1) = YEARWEEK(masaje.fecha,1);

SELECT * FROM vista_empleados_tramposos;

-- Todos los empleados que repiten, no repiten datos

SELECT DISTINCT id,
    nombre,
    apellido,
    genero,
    edad
FROM vista_empleados_tramposos;

-- Cantidad de hombres y mujeres que repiten

SELECT COUNT(Distinct id) AS total_mujeres
FROM vista_empleados_tramposos
WHERE genero = 'M';

SELECT COUNT(Distinct id) AS total_hombres
FROM vista_empleados_tramposos
WHERE genero = 'H';

-- Cantidad de gente que repite
SELECT COUNT(Distinct id) AS total_personas
FROM vista_empleados_tramposos;

-- Cantidad de personas que fueron a ambos servicios

SELECT COUNT(DISTINCT id) FROM vista_empleados_tramposos;

-- Cantidad de personas que fueron al servicio de masaje

SELECT COUNT(Distinct empleados.id)
FROM Empleados
INNER JOIN Masaje ON empleados.id = masaje.id_empleado;

-- Cantidad de personas que fueron al servicio de spa

SELECT COUNT(Distinct empleados.id)
FROM Empleados
INNER JOIN spa ON empleados.id = SPA.id_empleado;


-- Para ver cuantas veces se repite cada edad

SELECT
  edad,
  COUNT(*) AS cnt,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(DISTINCT id) FROM vista_empleados_tramposos), 2) AS pct
FROM vista_empleados_tramposos
GROUP BY edad;

-- Promedio de edad

SELECT AVG(edad) AS promedio
FROM (
    SELECT DISTINCT id, edad
    FROM vista_empleados_tramposos
) AS empleados_unicos;

