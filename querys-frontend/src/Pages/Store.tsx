import { useMemo, useState } from "react";
import "./Store.css";

type CustomerStatus = "Normal" | "En riesgo" | "Alto gasto";

interface Customer {
  id: number;
  name: string;
  email: string;
  totalSpent: number;
  orders: number;
  lastPurchase: string;
  status: CustomerStatus;
  avatar: string;
}

const customers: Customer[] = [
  {
    id: 1,
    name: "Sofía Martínez",
    email: "sofia@nova.com",
    totalSpent: 12450,
    orders: 18,
    lastPurchase: "2",
    status: "Alto gasto",
    avatar: "SM",
  },
  {
    id: 2,
    name: "Carlos Ramírez",
    email: "carlos@techcorp.com",
    totalSpent: 7350,
    orders: 12,
    lastPurchase: "5",
    status: "Normal",
    avatar: "CR",
  },
  {
    id: 3,
    name: "Laura González",
    email: "laura@digitalmx.com",
    totalSpent: 2180,
    orders: 5,
    lastPurchase: "45",
    status: "En riesgo",
    avatar: "LG",
  },
  {
    id: 4,
    name: "Diego Hernández",
    email: "diego@vision.com",
    totalSpent: 18900,
    orders: 25,
    lastPurchase: "1",
    status: "Alto gasto",
    avatar: "DH",
  },
  {
    id: 5,
    name: "Ana Torres",
    email: "ana@marketplus.com",
    totalSpent: 5600,
    orders: 9,
    lastPurchase: "8",
    status: "Normal",
    avatar: "AT",
  },
  {
    id: 6,
    name: "Miguel López",
    email: "miguel@softlab.com",
    totalSpent: 1250,
    orders: 3,
    lastPurchase: "62",
    status: "En riesgo",
    avatar: "ML",
  },
  {
    id: 7,
    name: "Valeria Sánchez",
    email: "valeria@grupoalpha.com",
    totalSpent: 15400,
    orders: 21,
    lastPurchase: "3",
    status: "Alto gasto",
    avatar: "VS",
  },
  {
    id: 8,
    name: "Jorge Pérez",
    email: "jorge@comercialjp.com",
    totalSpent: 4800,
    orders: 8,
    lastPurchase: "12",
    status: "Normal",
    avatar: "JP",
  },
];

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

type CustomerEvaluation = Customer & {
  status: CustomerStatus;
  checks: {
    orders: boolean;
    spend: boolean;
    avg: boolean;
  };
};

function evaluateCustomer(customer: Customer): CustomerEvaluation {
  const checks = {
    orders: customer.orders > 10,
    spend: customer.totalSpent > 20000,
    avg: Number(customer.lastPurchase) >= 4,
  };

  const passedConditions = Object.values(checks).filter(Boolean).length;

  let status: CustomerStatus = "Normal";

  if (passedConditions === 3) {
    status = "Alto gasto";
  } else if (passedConditions === 0) {
    status = "En riesgo";
  }

  return {
    ...customer,
    status,
    checks,
  };
}

const evaluatedCustomers = customers.map(evaluateCustomer);

export default function Store() {
  const [activeFilter, setActiveFilter] = useState<
    "Todos" | CustomerStatus
  >("Todos");

  const [search, setSearch] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const filteredCustomers = useMemo(() => {
    return evaluatedCustomers.filter((customer) => {
      const matchesFilter =
        activeFilter === "Todos" || customer.status === activeFilter;

      const query = search.toLowerCase();

      const matchesSearch =
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const normalCount = evaluatedCustomers.filter(
    (customer) => customer.status === "Normal"
  ).length;

  const riskCount = evaluatedCustomers.filter(
    (customer) => customer.status === "En riesgo"
  ).length;

  const highSpendCount = evaluatedCustomers.filter(
    (customer) => customer.status === "Alto gasto"
  ).length;

  const totalRevenue = evaluatedCustomers.reduce(
    (total, customer) => total + customer.totalSpent,
    0
  );

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
        <div className="sidebar-container">
          <div className="logo">
            <div className="logo-icon">+</div>
            <div>
              <strong>NovaCRM</strong>
              <span>Analytics</span>
            </div>
          </div>

          <nav>
            <a href="#dashboard" className="nav-item active" onClick={() => setMenuAbierto(false)}>
             
              Dashboard
            </a>

            <a href="#chart" className="nav-item" onClick={() => setMenuAbierto(false)}>
        
              Graficas
            </a>

            <a href="#clientes" className="nav-item" onClick={() => setMenuAbierto(false)}>
          
              Analitica
            </a>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">ANÁLISIS DE CLIENTES</p>
            <h1>Customer Dashboard</h1>
            <p className="subtitle">
              Conoce el comportamiento de tus clientes y detecta oportunidades.
            </p>
          </div>

         <div className="header-date">
            <span>Periodo:</span>
            <strong>
             Ultimos 90 días
            </strong>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Clientes mayores gastos</span>
            </div>

            <div className="stat-value">{highSpendCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Compradores normales</span>
            </div>

            <div className="stat-value">{normalCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Clientes en riesgo</span>
            </div>

            <div className="stat-value">{riskCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Ingresos generados</span>
            </div>

            <div className="stat-value">{money.format(totalRevenue)}</div>
          </div>
        </section>

        {/* Charts */}
        <section id="chart" className="analytics-grid">
          <div className="chart-card">
            <div className="card-heading">
              <div>
                <h3>Distribución de clientes</h3>
                <p>Clasificación según comportamiento de compra</p>
              </div>

              <button className="more-button">•••</button>
            </div>

            <div className="donut-wrapper">
              <div className="donut">
                <div className="donut-center">
                  <strong>{customers.length}</strong>
                  <span>Clientes</span>
                </div>
              </div>

              <div className="legend">
                <div className="legend-item">
                  <span className="dot green-dot" />
                  <div>
                    <strong>{normalCount} Clientes</strong>
                    <span>Compradores normales</span>
                  </div>
                  <b>37.5%</b>
                </div>

                <div className="legend-item">
                  <span className="dot orange-dot" />
                  <div>
                    <strong>{riskCount} Clientes</strong>
                    <span>En riesgo</span>
                  </div>
                  <b>25.0%</b>
                </div>

                <div className="legend-item">
                  <span className="dot purple-dot" />
                  <div>
                    <strong>{highSpendCount} Clientes</strong>
                    <span>Alto gasto</span>
                  </div>
                  <b>37.5%</b>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="card-heading">
              <div>
                <h3>Ingresos por segmento</h3>
                <p>Valor generado por cada tipo de cliente</p>
              </div>

              <button className="more-button">•••</button>
            </div>

            <div className="bar-chart">
              <div className="bar-row">
                <div className="bar-label">
                  <span>Alto gasto</span>
                  <strong>$46.7k</strong>
                </div>

                <div className="bar-background">
                  <div
                    className="bar purple-bar"
                    style={{ width: "92%" }}
                  />
                </div>
              </div>

              <div className="bar-row">
                <div className="bar-label">
                  <span>Normal</span>
                  <strong>$17.7k</strong>
                </div>

                <div className="bar-background">
                  <div
                    className="bar blue-bar"
                    style={{ width: "48%" }}
                  />
                </div>
              </div>

              <div className="bar-row">
                <div className="bar-label">
                  <span>En riesgo</span>
                  <strong>$3.4k</strong>
                </div>

                <div className="bar-background">
                  <div
                    className="bar orange-bar"
                    style={{ width: "18%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer table */}
        <section id="clientes" className="customers-card">
          <div className="table-header">
            <div>
              <h2>Clientes</h2>
              <p>Gestiona y analiza el comportamiento de tus clientes.</p>
            </div>
          </div>

          <div className="filters">
            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="filter-buttons">
              {(["Todos", "Normal", "En riesgo", "Alto gasto"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    className={
                      activeFilter === filter
                        ? "filter active-filter"
                        : "filter"
                    }
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>GASTO TOTAL</th>
                  <th>COMPRAS</th>
                  <th>PROMEDIO / MES</th>
                  <th>ESTADO</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {customer.avatar}
                        </div>

                        <div>
                          <strong>{customer.name}</strong>
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong className={customer.checks.spend ? "value-positive" : "value-negative"}>
                        {money.format(customer.totalSpent)}
                      </strong>
                    </td>

                    <td>
                      <span className={customer.checks.orders ? "value-positive" : "value-negative"}>
                        {customer.orders}
                      </span>
                    </td>

                    <td>
                      <span className={customer.checks.avg ? "value-positive" : "value-negative"}>
                        {customer.lastPurchase}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={customer.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="empty-state">
                No se encontraron clientes.
              </div>
            )}
          </div>

          <div className="pagination">
            <span>
              Mostrando <strong>1-{filteredCustomers.length}</strong> de{" "}
              <strong>{customers.length}</strong> clientes
            </span>

            <div>
              <button className="page-button" disabled>
                ‹
              </button>
              <button className="page-button page-active">1</button>
              <button className="page-button">2</button>
              <button className="page-button">›</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  const className =
    status === "Normal"
      ? "status normal"
      : status === "En riesgo"
      ? "status risk"
      : "status high";

  return (
    <span className={className}>
      <span className="status-dot" />
      {status}
    </span>
  );
}