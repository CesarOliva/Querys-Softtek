import { useEffect, useMemo, useState } from "react";
import "./Store.css";

type CustomerStatus = "Normal" | "En riesgo" | "Alto gasto";

interface Customer {
  id: number;
  name: string;
  email: string;
  totalSpent: number;
  orders: number;
  status: CustomerStatus;
  avatar: string;
}

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
    avg: customer.orders / 3 >= 4,
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

type ClientApiResponse = {
  id: number;
  nombre: string;
  email: string;
  total_gastado: number;
  total_pedidos: number;
};

type BestSellerApiResponse = {
  nombre: string;
  Cantidad: number;
  total_ventas: number;
};

interface BestSeller {
  name: string;
  sales: number;
  revenue: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function toBestSeller(item: BestSellerApiResponse): BestSeller {
  return {
    name: item.nombre,
    sales: Number(item.Cantidad) || 0,
    revenue: Number(item.total_ventas) || 0,
  };
}

function toCustomer(client: ClientApiResponse): Customer {
  return {
    id: client.id,
    name: client.nombre,
    email: client.email,
    totalSpent: Number(client.total_gastado) || 0,
    orders: Number(client.total_pedidos) || 0,
    status: "Normal",
    avatar: client.nombre
      .split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

export default function Store() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [bestSellersError, setBestSellersError] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "Todos" | CustomerStatus
  >("Todos");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const getClients = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clients`);

        if (!response.ok) {
          throw new Error("No se pudieron obtener los clientes");
        }

        const data: ClientApiResponse[] = await response.json();
        setCustomers(data.map(toCustomer));
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudieron obtener los clientes"
        );
      } finally {
        setLoading(false);
      }
    };

    getClients();
  }, []);

  useEffect(() => {
    const getBestSellers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clients/best-sellers`);

        if (!response.ok) {
          throw new Error("No se pudieron obtener los best sellers");
        }

        const data: BestSellerApiResponse[] = await response.json();
        setBestSellers(data.map(toBestSeller));
      } catch (requestError) {
        setBestSellersError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudieron obtener los best sellers"
        );
      } finally {
        setBestSellersLoading(false);
      }
    };

    getBestSellers();
  }, []);

  const evaluatedCustomers = useMemo(
    () => customers.map(evaluateCustomer),
    [customers]
  );

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
  }, [activeFilter, search, evaluatedCustomers]);

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

  const normalRevenue = evaluatedCustomers
    .filter((customer) => customer.status === "Normal")
    .reduce((total, customer) => total + customer.totalSpent, 0);

  const riskRevenue = evaluatedCustomers
    .filter((customer) => customer.status === "En riesgo")
    .reduce((total, customer) => total + customer.totalSpent, 0);

  const highSpendRevenue = evaluatedCustomers
    .filter((customer) => customer.status === "Alto gasto")
    .reduce((total, customer) => total + customer.totalSpent, 0);

  const percentage = (value: number) =>
    evaluatedCustomers.length === 0
      ? 0
      : (value / evaluatedCustomers.length) * 100;

  const maxSegmentRevenue = Math.max(
    normalRevenue,
    riskRevenue,
    highSpendRevenue,
    1
  );

  const normalPercentage = percentage(normalCount);
  const riskPercentage = percentage(riskCount);
  const highSpendPercentage = percentage(highSpendCount);

  return (
    <div className="clientes dashboard">
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
              <div
                className="donut"
                style={{
                  background: `conic-gradient(#16a34a 0 ${normalPercentage}%, #f59e0b ${normalPercentage}% ${normalPercentage + riskPercentage}%, #8b5cf6 ${normalPercentage + riskPercentage}% 100%)`,
                }}
              >
                <div className="donut-center">
                  <strong>{evaluatedCustomers.length}</strong>
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
                  <b>{normalPercentage.toFixed(1)}%</b>
                </div>

                <div className="legend-item">
                  <span className="dot orange-dot" />
                  <div>
                    <strong>{riskCount} Clientes</strong>
                    <span>En riesgo</span>
                  </div>
                  <b>{riskPercentage.toFixed(1)}%</b>
                </div>

                <div className="legend-item">
                  <span className="dot purple-dot" />
                  <div>
                    <strong>{highSpendCount} Clientes</strong>
                    <span>Alto gasto</span>
                  </div>
                  <b>{highSpendPercentage.toFixed(1)}%</b>
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
                  <strong>{money.format(highSpendRevenue)}</strong>
                </div>

                <div className="bar-background">
                  <div
                    className="bar purple-bar"
                    style={{ width: `${(highSpendRevenue / maxSegmentRevenue) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bar-row">
                <div className="bar-label">
                  <span>Normal</span>
                  <strong>{money.format(normalRevenue)}</strong>
                </div>

                <div className="bar-background">
                  <div
                    className="bar blue-bar"
                    style={{ width: `${(normalRevenue / maxSegmentRevenue) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bar-row">
                <div className="bar-label">
                  <span>En riesgo</span>
                  <strong>{money.format(riskRevenue)}</strong>
                </div>

                <div className="bar-background">
                  <div
                    className="bar orange-bar"
                    style={{ width: `${(riskRevenue / maxSegmentRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best sellers */}
        <section className="customers-card">
          <div className="table-header">
            <div>
              <h2>Best sellers</h2>
              <p>Los 10 libros más vendidos.</p>
            </div>
          </div>

          <div className="table-container">
            {bestSellersLoading && (
              <div className="empty-state">Cargando best sellers...</div>
            )}
            {!bestSellersLoading && bestSellersError && (
              <div className="empty-state">{bestSellersError}</div>
            )}

            <table className="best-sellers-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>LIBRO</th>
                  <th>VENTAS</th>
                  <th>INGRESO</th>
                </tr>
              </thead>

              <tbody>
                {bestSellers.map((book, index) => (
                  <tr key={`${book.name}-${index}`}>
                    <td>
                      <span className="rank-badge">{index + 1}</span>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {book.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{book.name}</strong>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="value-positive">{book.sales}</span>
                    </td>

                    <td>
                      <strong>{money.format(book.revenue)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!bestSellersLoading &&
              !bestSellersError &&
              bestSellers.length === 0 && (
                <div className="empty-state">
                  No se encontraron best sellers.
                </div>
              )}
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
            {loading && <div className="empty-state">Cargando clientes...</div>}
            {!loading && error && <div className="empty-state">{error}</div>}
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
                        {(customer.orders / 3).toFixed(1)}
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
              <strong>{evaluatedCustomers.length}</strong> clientes
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