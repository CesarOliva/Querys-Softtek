import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

type Filtros = {
  genero: string;
  rangoEdad: string;
  idUsuario: string;
  tipo: string;
};

type Usuario = {
  id: number;
  nombre?: string;
  apellido?: string;
  genero?: string;
  edad?: number;
  tipo?: string;
};

type ResumenApi = {
  total_usuarios?: number;
  usuarios_solo_masaje?: number;
  pct_usuarios_solo_masaje?: number;
  usuarios_solo_spa?: number;
  pct_usuarios_solo_spa?: number;
  usuarios_ambas?: number;
  pct_usuarios_ambas?: number;
  visitas_masaje?: number;
  pct_visitas_masaje?: number;
  visitas_spa?: number;
  pct_visitas_spa?: number;
  visitas_ambas?: number;
  pct_visitas_ambas?: number;
  total_visitas?: number;
};

type RangoEdad = {
  rango: string;
  orden: number;
  cantidad: number;
  porcentaje: number;
};

type GeneroAgrupado = {
  genero: string;
  cantidad: number;
  porcentaje: number;
};

type EdadCrudaApi = {
  id: number;
  edad: number;
};

type GeneroCrudoApi = {
  id: number;
  genero: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const normalizarGenero = (valor?: string) => {
  const genero = (valor ?? "").trim().toLowerCase();

  // En la BD: 'H' = hombre, 'M' = mujer
  if (["h", "masculino", "hombre"].includes(genero)) return "masculino";
  if (["m", "f", "femenino", "mujer"].includes(genero)) return "femenino";

  return genero;
};

const formatearGenero = (valor?: string) => {
  const genero = (valor ?? "").trim();

  // En la BD: 'H' = hombre, 'M' = mujer
  if (["H", "h", "masculino", "Masculino", "hombre", "Hombre"].includes(genero)) return "Masculino";
  if (["M", "m", "F", "f", "femenino", "Femenino", "mujer", "Mujer"].includes(genero)) return "Femenino";

  return genero || "No especificado";
};

const formatearTipo = (valor?: string) => {
  if (valor === "solo_masaje") return "Solo masaje";
  if (valor === "solo_spa") return "Solo spa";
  if (valor === "ambas") return "Ambas (misma semana)";
  if (valor === "mixto") return "Mixto (distinta semana)";
  return valor || "N/A";
};

const obtenerNombreCompleto = (usuario: Usuario) => {
  const nombre = (usuario.nombre ?? "").trim();
  const apellido = (usuario.apellido ?? "").trim();

  if (nombre && apellido) return `${nombre} ${apellido}`;
  if (nombre) return nombre;
  return `Empleado ${usuario.id}`;
};

// Rangos de 10 en 10: 20-29, 30-39, 40-49, 50-59
const cumpleRangoEdad = (edad: number, rango: string) => {
  const match = rango.match(/^(\d+)-(\d+)$/);
  if (!match) return true;
  const inicio = Number(match[1]);
  const fin = Number(match[2]);
  return edad >= inicio && edad <= fin;
};

function Dashboard() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [resumen, setResumen] = useState<ResumenApi>({});
  const [edades, setEdades] = useState<EdadCrudaApi[]>([]);
  const [generosCrudos, setGenerosCrudos] = useState<GeneroCrudoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState<Filtros>({
    genero: "",
    rangoEdad: "",
    idUsuario: "",
    tipo: "",
  });

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const [
          totalUsuariosRes,
          totalVisitasRes,
          soloMasajeRes,
          visitasMasajeRes,
          soloSpaRes,
          visitasSpaRes,
          ambasUsuariosRes,
          ambasVisitasRes,
          edadesRes,
          generosRes,
          usuariosRes,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/services/usuarios/total`),
          fetch(`${API_BASE_URL}/services/visitas/total`),
          fetch(`${API_BASE_URL}/services/masaje/usuarios-solo`),
          fetch(`${API_BASE_URL}/services/masaje/total`),
          fetch(`${API_BASE_URL}/services/spa/usuarios-solo`),
          fetch(`${API_BASE_URL}/services/spa/total`),
          fetch(`${API_BASE_URL}/services/repetidores/total`),
          fetch(`${API_BASE_URL}/services/ambas/visitas`),
          fetch(`${API_BASE_URL}/services/edades`),
          fetch(`${API_BASE_URL}/services/genero`),
          fetch(`${API_BASE_URL}/services/usuarios`),
        ]);

        const [
          totalUsuariosData,
          totalVisitasData,
          soloMasajeData,
          visitasMasajeData,
          soloSpaData,
          visitasSpaData,
          ambasUsuariosData,
          ambasVisitasData,
          edadesData,
          generosData,
          usuariosData,
        ] = await Promise.all([
          totalUsuariosRes.json(),
          totalVisitasRes.json(),
          soloMasajeRes.json(),
          visitasMasajeRes.json(),
          soloSpaRes.json(),
          visitasSpaRes.json(),
          ambasUsuariosRes.json(),
          ambasVisitasRes.json(),
          edadesRes.json(),
          generosRes.json(),
          usuariosRes.json(),
        ]);

        setResumen({
          total_usuarios: Number(totalUsuariosData?.total_usuarios ?? 0),
          total_visitas: Number(totalVisitasData?.total_visitas ?? 0),
          usuarios_solo_masaje: Number(soloMasajeData?.usuarios_solo_masaje ?? 0),
          pct_usuarios_solo_masaje: pct(
            Number(soloMasajeData?.usuarios_solo_masaje ?? 0),
            Number(totalUsuariosData?.total_usuarios ?? 0)
          ),
          visitas_masaje: Number(visitasMasajeData?.visitas_masaje ?? 0),
          pct_visitas_masaje: pct(
            Number(visitasMasajeData?.visitas_masaje ?? 0),
            Number(totalVisitasData?.total_visitas ?? 0)
          ),
          usuarios_solo_spa: Number(soloSpaData?.usuarios_solo_spa ?? 0),
          pct_usuarios_solo_spa: pct(
            Number(soloSpaData?.usuarios_solo_spa ?? 0),
            Number(totalUsuariosData?.total_usuarios ?? 0)
          ),
          visitas_spa: Number(visitasSpaData?.visitas_spa ?? 0),
          pct_visitas_spa: pct(
            Number(visitasSpaData?.visitas_spa ?? 0),
            Number(totalVisitasData?.total_visitas ?? 0)
          ),
          usuarios_ambas: Number(ambasUsuariosData?.usuarios_ambas ?? 0),
          pct_usuarios_ambas: pct(
            Number(ambasUsuariosData?.usuarios_ambas ?? 0),
            Number(totalUsuariosData?.total_usuarios ?? 0)
          ),
          visitas_ambas: Number(ambasVisitasData?.visitas_ambas ?? 0),
          pct_visitas_ambas: pct(
            Number(ambasVisitasData?.visitas_ambas ?? 0),
            Number(totalVisitasData?.total_visitas ?? 0)
          ),
        });
        setEdades(Array.isArray(edadesData) ? edadesData : []);
        setGenerosCrudos(Array.isArray(generosData) ? generosData : []);
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    void cargarDashboard();
  }, []);

  const actualizarFiltro = (campo: keyof Filtros, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      genero: "",
      rangoEdad: "",
      idUsuario: "",
      tipo: "",
    });
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const generoUsuario = normalizarGenero(usuario.genero);
      const generoFiltro = normalizarGenero(filtros.genero);

      if (filtros.genero && generoUsuario !== generoFiltro) {
        return false;
      }

      if (filtros.tipo && (usuario.tipo ?? "") !== filtros.tipo) {
        return false;
      }

      if (filtros.idUsuario) {
        const idUsuario = String(usuario.id ?? "");
        if (!idUsuario.toLowerCase().includes(filtros.idUsuario.toLowerCase())) {
          return false;
        }
      }

      if (filtros.rangoEdad) {
        const edad = Number(usuario.edad ?? 0);
        if (!cumpleRangoEdad(edad, filtros.rangoEdad)) return false;
      }

      return true;
    });
  }, [filtros, usuarios]);

  const totalVista = usuariosFiltrados.length;
  const num = (valor?: number) => Number(valor ?? 0);

  // Porcentaje con 2 decimales (antes se calculaba en SQL)
  const pct = (parte: number, total: number) =>
    total ? Math.round((parte / total) * 10000) / 100 : 0;

  const totalUsuarios = num(resumen.total_usuarios ?? usuarios.length);
  const totalVisitas = num(resumen.total_visitas);

  // Distribución por rangos de 10 en 10 desde las edades crudas
  const rangos: RangoEdad[] = useMemo(() => {
    const grupos = new Map<number, number>();

    edades.forEach(({ edad }) => {
      if (edad == null) return;
      const base = Math.floor(Number(edad) / 10) * 10;
      grupos.set(base, (grupos.get(base) ?? 0) + 1);
    });

    return [...grupos.entries()]
      .sort(([a], [b]) => a - b)
      .map(([base, cantidad]) => ({
        rango: `${base}-${base + 9}`,
        orden: base,
        cantidad,
        porcentaje: pct(cantidad, totalUsuarios),
      }));
  }, [edades, totalUsuarios]);

  // Distribución por género desde los géneros crudos ('H'/'M')
  const generos: GeneroAgrupado[] = useMemo(() => {
    const grupos = new Map<string, number>();

    generosCrudos.forEach(({ genero }) => {
      const clave = formatearGenero(genero);
      grupos.set(clave, (grupos.get(clave) ?? 0) + 1);
    });

    return [...grupos.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([genero, cantidad]) => ({
        genero,
        cantidad,
        porcentaje: pct(cantidad, totalUsuarios),
      }));
  }, [generosCrudos, totalUsuarios]);

  const maxRango = rangos.reduce((max, item) => Math.max(max, Number(item.cantidad ?? 0)), 0);
  const maxGenero = generos.reduce((max, item) => Math.max(max, Number(item.cantidad ?? 0)), 0);

  const colorGenero = (genero: string) => genero === "Femenino" ? "#7c3aed" : genero === "Masculino" ? "#2563eb" : "#98a2b3";

  const pctSoloMasaje = num(resumen.pct_usuarios_solo_masaje);
  const pctSoloSpa = num(resumen.pct_usuarios_solo_spa);
  const pctAmbas = num(resumen.pct_usuarios_ambas);

  return (
    <div className="app">
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <main className="main" id="dashboard">
        <header className="header">

          <div>
            <h1>Dashboard de servicios</h1>
            <p>Consulta y analiza el uso de los servicios de bienestar.</p>
          </div>

          <div className="header-date">
            <span>Última actualización</span>
            <strong>
              {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
            </strong>
          </div>
        </header>

        <div className="content-layout">
          <div className="dashboard-content">
            <section className="stats">
              <StatCard
                title="Total usuarios"
                value={totalUsuarios}
                subtitle="Todos los usuarios"
                icon="👥"
                color="orange"
              />

              <StatCard
                title="Total visitas"
                value={totalVisitas}
                subtitle="Todas las visitas"
                icon="📊"
                color="orange"
              />

              <StatCard
                title="Usuarios solo masajes"
                value={num(resumen.usuarios_solo_masaje)}
                subtitle={`${pctSoloMasaje}% de los usuarios`}
                icon="💆"
                color="blue"
              />

              <StatCard
                title="Visitas a masajes"
                value={num(resumen.visitas_masaje)}
                subtitle={`${num(resumen.pct_visitas_masaje)}% de las visitas`}
                icon="💆‍♀️"
                color="blue"
              />

              <StatCard
                title="Usuarios solo spa"
                value={num(resumen.usuarios_solo_spa)}
                subtitle={`${pctSoloSpa}% de los usuarios`}
                icon="🧖"
                color="purple"
              />

              <StatCard
                title="Visitas a spa"
                value={num(resumen.visitas_spa)}
                subtitle={`${num(resumen.pct_visitas_spa)}% de las visitas`}
                icon="🧖‍♀️"
                color="purple"
              />

              <StatCard
                title="Usuarios ambas"
                value={num(resumen.usuarios_ambas)}
                subtitle={`${pctAmbas}% de los usuarios`}
                icon="🔄"
                color="green"
              />

              <StatCard
                title="Visitas ambas"
                value={num(resumen.visitas_ambas)}
                subtitle={`${num(resumen.pct_visitas_ambas)}% de las visitas`}
                icon="♻️"
                color="green"
              />
            </section>

            <section id="reportes" className="dashboard-grid">
              <div className="card chart-card">
                <div className="card-title">
                  <div>
                    <h2>Distribución por edad</h2>
                    <p>Rangos de 10 años sobre todos los usuarios.</p>
                  </div>
                </div>

                <div className="chart">
                  {rangos.length > 0 ? (
                    rangos.map((item) => (
                      <Bar
                        key={item.rango}
                        label={`${item.rango} años (${Number(item.porcentaje ?? 0)}%)`}
                        value={item.cantidad}
                        total={maxRango || 1}
                        color="#2563eb"
                      />
                    ))
                  ) : (
                    <p className="empty">No hay datos de edad disponibles.</p>
                  )}
                </div>

                <div className="card-title" style={{ marginTop: "28px", marginBottom: "16px" }}>
                  <div>
                    <h2>Distribución por género</h2>
                    <p>Participación sobre todos los usuarios.</p>
                  </div>
                </div>

                <div className="chart">
                  {generos.length > 0 ? (
                    generos.map((item) => (
                      <Bar
                        key={item.genero}
                        label={`${item.genero} (${Number(item.porcentaje ?? 0)}%)`}
                        value={item.cantidad}
                        total={maxGenero || 1}
                        color={colorGenero(item.genero)}
                      />
                    ))
                  ) : (
                    <p className="empty">No hay datos de género disponibles.</p>
                  )}
                </div>
              </div>

              <div className="card summary-card">
                <div className="card-title">
                  <div>
                    <h2>Resumen</h2>
                    <p>Distribución de usuarios</p>
                  </div>
                </div>

                <div className="donut-container">
                  <div
                    className="donut"
                    style={{
                      background: `conic-gradient(
                        #2563eb 0% ${pctSoloMasaje}%,
                        #7c3aed ${pctSoloMasaje}% ${pctSoloMasaje + pctSoloSpa}%,
                        #059669 ${pctSoloMasaje + pctSoloSpa}% ${pctSoloMasaje + pctSoloSpa + pctAmbas}%,
                        #eaecf0 ${pctSoloMasaje + pctSoloSpa + pctAmbas}% 100%
                      )`,
                    }}
                  >
                    <div>
                      <strong>{totalUsuarios}</strong>
                      <span>Usuarios</span>
                    </div>
                  </div>
                </div>

                <div className="legend">
                  <Legend
                    color="#2563eb"
                    label={`Solo masajes (${pctSoloMasaje}%)`}
                    value={num(resumen.usuarios_solo_masaje)}
                  />
                  <Legend
                    color="#7c3aed"
                    label={`Solo spa (${pctSoloSpa}%)`}
                    value={num(resumen.usuarios_solo_spa)}
                  />
                  <Legend
                    color="#059669"
                    label={`Ambas (${pctAmbas}%)`}
                    value={num(resumen.usuarios_ambas)}
                  />
                  <Legend
                    color="#eaecf0"
                    label="Mixto (distinta semana)"
                    value={
                      totalUsuarios -
                      num(resumen.usuarios_solo_masaje) -
                      num(resumen.usuarios_solo_spa) -
                      num(resumen.usuarios_ambas)
                    }
                  />
                  <Legend color="#f59e0b" label="Total visitas" value={totalVisitas} />
                </div>
              </div>
            </section>

            <section className="card table-card" id="usuarios">
              <div className="card-title table-header">
                <div>
                  <h2>Usuarios</h2>
                  <p>Detalle de todos los usuarios que visitaron masaje o spa.</p>
                </div>

                <span className="counter">{totalVista} registros</span>
              </div>

              <div className="table-container">
                {loading ? (
                  <p className="empty">Cargando usuarios...</p>
                ) : error ? (
                  <p className="empty">{error}</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Género</th>
                        <th>Edad</th>
                        <th>Servicio</th>
                      </tr>
                    </thead>

                    <tbody>
                      {usuariosFiltrados.map((usuario) => (
                        <tr key={usuario.id}>
                          <td>
                            <strong>#{usuario.id}</strong>
                          </td>

                          <td>
                            <div className="user-cell">
                              <div className="small-avatar">
                                {obtenerNombreCompleto(usuario)
                                  .split(" ")
                                  .map((nombre) => nombre[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              {obtenerNombreCompleto(usuario)}
                            </div>
                          </td>

                          <td>{formatearGenero(usuario.genero)}</td>
                          <td>{usuario.edad ?? "N/A"}</td>
                          <td>{formatearTipo(usuario.tipo)}</td>
                        </tr>
                      ))}

                      {usuariosFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={5} className="empty">
                            No se encontraron usuarios con los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>

          <aside className="filters-sidebar">
            <section className="filters-card">
              <div className="filter-header">
                <div>
                  <h2>Filtros</h2>
                  <span>Personaliza los resultados.</span>
                </div>

                <button className="clear-button" onClick={limpiarFiltros}>
                  Limpiar
                </button>
              </div>

              <div className="filters">
                <div className="filter">
                  <label>Servicio</label>
                  <select value={filtros.tipo} onChange={(e) => actualizarFiltro("tipo", e.target.value)}>
                    <option value="">Todos</option>
                    <option value="solo_masaje">Solo masaje</option>
                    <option value="solo_spa">Solo spa</option>
                    <option value="ambas">Ambas (misma semana)</option>
                    <option value="mixto">Mixto (distinta semana)</option>
                  </select>
                </div>

                <div className="filter">
                  <label>Género</label>
                  <select value={filtros.genero} onChange={(e) => actualizarFiltro("genero", e.target.value)}>
                    <option value="">Todos</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>

                <div className="filter">
                  <label>Rango de edad</label>
                  <select value={filtros.rangoEdad} onChange={(e) => actualizarFiltro("rangoEdad", e.target.value)}>
                    <option value="">Todas las edades</option>
                    <option value="20-29">20 - 29</option>
                    <option value="30-39">30 - 39</option>
                    <option value="40-49">40 - 49</option>
                    <option value="50-59">50 - 59</option>
                  </select>
                </div>

                <div className="filter">
                  <label>ID de usuario</label>
                  <input
                    type="text"
                    placeholder="Ej. 1001"
                    value={filtros.idUsuario}
                    onChange={(e) => actualizarFiltro("idUsuario", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <div className="results-info">
              <span>
                Mostrando <strong>{totalVista}</strong> usuarios
              </span>

              {(filtros.genero || filtros.rangoEdad || filtros.idUsuario || filtros.tipo) && (
                <span className="filtered">● Filtros activos</span>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
  id?: string;
};

function StatCard({ title, value, subtitle, icon, color, id }: StatCardProps) {
  return (
    <div id={id} className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>

      <div className="stat-content">
        <span>{title}</span>

        <div className="stat-number">{value}</div>

        <small>{subtitle}</small>
      </div>
    </div>
  );
}

type BarProps = {
  label: string;
  value: number;
  total: number;
  color: string;
};

function Bar({ label, value, total, color }: BarProps) {
  const width = total > 0 ? Math.max((value / total) * 100, value > 0 ? 4 : 0) : 0;

  return (
    <div className="bar-row">
      <div className="bar-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="bar-background">
        <div className="bar-fill" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  );
}

type LegendProps = {
  color: string;
  label: string;
  value: number;
};

function Legend({ color, label, value }: LegendProps) {
  return (
    <div className="legend-item">
      <div className="legend-label">
        <span className="legend-dot" style={{ background: color }} />
        {label}
      </div>

      <strong>{value}</strong>
    </div>
  );
}

export default Dashboard;
