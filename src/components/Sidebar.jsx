import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import Icons from "./Icons";
import "../styles/sidebar.css";

const navItems = [
  { path: "/chat",    label: "Chat",      icon: Icons.chat    },
  { path: "/upload",  label: "Documents", icon: Icons.doc     },
  { path: "/history", label: "History",   icon: Icons.history },
];

export default function Sidebar({ email, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Doc<span>Mind</span></h1>
        <p>AI Document Assistant</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Workspace</div>
        {navItems.map((n) => (
          <NavLink
            key={n.path}
            to={n.path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon d={n.icon} size={16} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{email?.[0]?.toUpperCase()}</div>
          <span className="user-name">{email}</span>
          <button className="logout-btn" onClick={onLogout} title="Sign out">
            <Icon d={Icons.logout} size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}