import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

type Filtros = {
  genero: string;
  rangoEdad: string;
  idUsuario: string;
};

type Empleado = {
  id: number;
  nombre?: string;
  apellido?: string;
  genero?: string;
  edad?: number;
};

type ResumenApi = {
  total_personas?: number;
  total_mujeres?: number;
  total_hombres?: number;
  total_masaje?: number;
  total_spa?: number;
  promedio?: number;
};

type EdadApi = {
  edad: number;
  cantidad: number;
  porcentaje: number;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const normalizarGenero = (valor?: string) => {
  const genero = (valor ?? "").trim().toLowerCase();

  if (["m", "h", "masculino", "hombre"].includes(genero)) return "masculino";
  if (["f", "femenino", "mujer"].includes(genero)) return "femenino";

  return genero;
};

const formatearGenero = (valor?: string) => {
  const genero = (valor ?? "").trim();

  if (["M", "H", "masculino", "Masculino"].includes(genero)) return "Masculino";
  if (["F", "femenino", "Femenino"].includes(genero)) return "Femenino";

  return genero || "No especificado";
};

const obtenerNombreCompleto = (usuario: Empleado) => {
  const nombre = (usuario.nombre ?? "").trim();
  const apellido = (usuario.apellido ?? "").trim();

  if (nombre && apellido) return `${nombre} ${apellido}`;
  if (nombre) return nombre;
  return `Empleado ${usuario.id}`;
};

function Dashboard() {
  const [usuarios, setUsuarios] = useState<Empleado[]>([]);
  const [resumen, setResumen] = useState<ResumenApi>({});
  const [edades, setEdades] = useState<EdadApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState<Filtros>({
    genero: "",
    rangoEdad: "",
    idUsuario: "",
  });
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const [repetidoresRes, mujeresRes, hombresRes, totalRes, masajeRes, spaRes, edadesRes, promedioRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/services/repetidores`),
            fetch(`${API_BASE_URL}/services/repetidores/mujeres`),
            fetch(`${API_BASE_URL}/services/repetidores/hombres`),
            fetch(`${API_BASE_URL}/services/repetidores/total`),
            fetch(`${API_BASE_URL}/services/masaje/total`),
            fetch(`${API_BASE_URL}/services/spa/total`),
            fetch(`${API_BASE_URL}/services/repetidores/edades`),
            fetch(`${API_BASE_URL}/services/repetidores/promedio-edad`),
          ]);

        const [repetidores, mujeres, hombres, total, masaje, spa, edadesData, promedio] = await Promise.all([
          repetidoresRes.json(),
          mujeresRes.json(),
          hombresRes.json(),
          totalRes.json(),
          masajeRes.json(),
          spaRes.json(),
          edadesRes.json(),
          promedioRes.json(),
        ]);

        setUsuarios(Array.isArray(repetidores) ? repetidores : []);
        setResumen({
          total_personas: Number(total?.total_personas ?? repetidores?.length ?? 0),
          total_mujeres: Number(mujeres?.total_mujeres ?? 0),
          total_hombres: Number(hombres?.total_hombres ?? 0),
          total_masaje: Number(masaje?.total_masaje ?? 0),
          total_spa: Number(spa?.total_spa ?? 0),
          promedio: Number(promedio?.promedio ?? 0),
        });
        setEdades(Array.isArray(edadesData) ? edadesData : []);
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
    });
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const generoUsuario = normalizarGenero(usuario.genero);
      const generoFiltro = normalizarGenero(filtros.genero);

      if (filtros.genero && generoUsuario !== generoFiltro) {
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

        if (filtros.rangoEdad === "18-25" && !(edad >= 18 && edad <= 25)) return false;
        if (filtros.rangoEdad === "26-35" && !(edad >= 26 && edad <= 35)) return false;
        if (filtros.rangoEdad === "36-45" && !(edad >= 36 && edad <= 45)) return false;
        if (filtros.rangoEdad === "46-55" && !(edad >= 46 && edad <= 55)) return false;
        if (filtros.rangoEdad === "56+" && edad < 56) return false;
      }

      return true;
    });
  }, [filtros, usuarios]);

  const totalVista = usuariosFiltrados.length;
  const totalRepetidores = Number(resumen.total_personas ?? usuarios.length ?? 0);
  const totalMasaje = Number(resumen.total_masaje ?? 0);
  const totalSpa = Number(resumen.total_spa ?? 0);
  const totalMujeres = Number(resumen.total_mujeres ?? 0);
  const totalHombres = Number(resumen.total_hombres ?? 0);
  const promedioEdad = Number(resumen.promedio ?? 0);

  const porcentaje = (cantidad: number, base: number) => {
    if (!base) return 0;
    return Math.round((cantidad / base) * 100);
  };

  const maxEdad = edades.reduce((max, item) => Math.max(max, Number(item.cantidad ?? 0)), 0);

  return (
    <div className="app">
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
        <div className="sidebar-container">
          <div className="logo">
            <div className="logo-icon">+</div>
            <div>
              <strong>HealthCare</strong>
              <span>Dashboard</span>
            </div>
          </div>

          <nav>
            <a href="#dashboard" className="nav-item active" onClick={() => setMenuAbierto(false)}>
              <span>▦</span>
              Dashboard
            </a>

            <a href="#reportes" className="nav-item" onClick={() => setMenuAbierto(false)}>
              <span>📊</span>
              Reportes
            </a>

            <a href="#usuarios" className="nav-item" onClick={() => setMenuAbierto(false)}>
              <span>👥</span>
              Usuarios
            </a>
          </nav>
        </div>
      </aside>

      <main className="main" id="dashboard">
        <header className="header">
          <button className="mobile-menu" onClick={() => setMenuAbierto(!menuAbierto)}>
            ☰
          </button>

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
                title="Masajes"
                value={totalMasaje}
                percentage={porcentaje(totalMasaje, totalRepetidores || 1)}
                icon="💆"
                color="blue"
              />

              <StatCard
                title="Spa"
                value={totalSpa}
                percentage={porcentaje(totalSpa, totalRepetidores || 1)}
                icon="🧖"
                color="purple"
              />

              <StatCard
                title="Repetidores"
                value={totalRepetidores}
                percentage={porcentaje(totalRepetidores, totalRepetidores || 1)}
                icon="🔄"
                color="green"
              />

              <StatCard
                title="Promedio edad"
                value={Number(promedioEdad.toFixed(2))}
                percentage={porcentaje(Math.round(promedioEdad), totalRepetidores || 1)}
                icon="📈"
                color="orange"
              />
            </section>

            <section id="reportes" className="dashboard-grid">
              <div className="card chart-card">
                <div className="card-title">
                  <div>
                    <h2>Distribución por edad</h2>
                    <p>Participación de empleados repetidores por grupo etario.</p>
                  </div>
                </div>

                <div className="chart">
                  {edades.length > 0 ? (
                    edades.map((item) => (
                      <Bar key={item.edad} label={`Edad ${item.edad}`} value={item.cantidad} total={maxEdad || 1} color="#2563eb" />
                    ))
                  ) : (
                    <p className="empty">No hay datos de edad disponibles.</p>
                  )}
                </div>
              </div>

              <div className="card summary-card">
                <div className="card-title">
                  <div>
                    <h2>Resumen</h2>
                    <p>Datos generales</p>
                  </div>
                </div>

                <div className="donut-container">
                  <div
                    className="donut"
                    style={{
                      background: `conic-gradient(
                        #2563eb 0% ${porcentaje(totalMasaje, totalRepetidores || 1)}%,
                        #7c3aed ${porcentaje(totalMasaje, totalRepetidores || 1)}% ${(porcentaje(totalMasaje, totalRepetidores || 1) + porcentaje(totalSpa, totalRepetidores || 1))}%,
                        #059669 ${(porcentaje(totalMasaje, totalRepetidores || 1) + porcentaje(totalSpa, totalRepetidores || 1))}% ${(porcentaje(totalMasaje, totalRepetidores || 1) + porcentaje(totalSpa, totalRepetidores || 1) + porcentaje(totalRepetidores, totalRepetidores || 1))}%,
                        #f59e0b ${(porcentaje(totalMasaje, totalRepetidores || 1) + porcentaje(totalSpa, totalRepetidores || 1) + porcentaje(totalRepetidores, totalRepetidores || 1))}% 100%
                      )`,
                    }}
                  >
                    <div>
                      <strong>{totalRepetidores}</strong>
                      <span>Repetidores</span>
                    </div>
                  </div>
                </div>

                <div className="legend">
                  <Legend color="#2563eb" label="Masajes" value={totalMasaje} />
                  <Legend color="#7c3aed" label="Spa" value={totalSpa} />
                  <Legend color="#059669" label="Mujeres" value={totalMujeres} />
                  <Legend color="#f59e0b" label="Hombres" value={totalHombres} />
                </div>
              </div>
            </section>

            <section className="card table-card" id="usuarios">
              <div className="card-title table-header">
                <div>
                  <h2>Usuarios</h2>
                  <p>Detalle de empleados repetidores.</p>
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
                        </tr>
                      ))}

                      {usuariosFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={4} className="empty">
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
                    <option value="18-25">18 - 25</option>
                    <option value="26-35">26 - 35</option>
                    <option value="36-45">36 - 45</option>
                    <option value="46-55">46 - 55</option>
                    <option value="56+">56+</option>
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

              {(filtros.genero || filtros.rangoEdad || filtros.idUsuario) && (
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
  percentage: number;
  icon: string;
  color: string;
  id?: string;
};

function StatCard({ title, value, percentage, icon, color, id }: StatCardProps) {
  return (
    <div id={id} className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>

      <div className="stat-content">
        <span>{title}</span>

        <div className="stat-number">{value}</div>

        <small>{percentage}% del total</small>
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
