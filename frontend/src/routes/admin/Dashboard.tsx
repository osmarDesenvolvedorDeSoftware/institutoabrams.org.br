export const Dashboard = () => {
  const stats = [
    { label: "Páginas publicadas", value: 6 },
    { label: "Menus ativos", value: 5 },
    { label: "Usuários logados", value: 1 },
  ];

  return (
    <div className="grid three">
      {stats.map((stat) => (
        <div key={stat.label} className="card">
          <p style={{ margin: 0, color: "#94a3b8" }}>{stat.label}</p>
          <h2 style={{ margin: "0.25rem 0", color: "#0f172a" }}>{stat.value}</h2>
        </div>
      ))}
    </div>
  );
};
