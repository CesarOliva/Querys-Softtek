SELECT empleados.nombre, empleados.apellido, empleados.genero, empleados.edad, masaje.fecha, spa.fecha
FROM empleados
INNER JOIN Masaje ON empleados.id = masaje.id_empleado 
INNER JOIN Spa ON masaje.id = spa.id_empleado AND YEARWEEK(spa.fecha,1) = YEARWEEK(masaje.fecha,1);


SELECT empleados.id,empleados.nombre, empleados.apellido, empleados.genero, empleados.edad, 
COUNT(masaje.id_empleado) AS empleado
FROM empleados
INNER JOIN Masaje ON empleados.id = masaje.id_empleado
GROUP BY empleados.id,empleados.nombre, empleados.apellido, empleados.genero, empleados.edad, masaje.fecha;