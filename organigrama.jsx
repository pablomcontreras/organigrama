import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCLGemBRVz3f17c7n071RUQanam6GYVu3g",
  authDomain: "orgama-dandelion.firebaseapp.com",
  projectId: "orgama-dandelion",
  storageBucket: "orgama-dandelion.firebasestorage.app",
  messagingSenderId: "1080621937032",
  appId: "1:1080621937032:web:42f554dc21cc2feb2a4a3d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const generateId = () => Math.random().toString(36).substring(2, 9);

const COLOR_PALETTE = {
  green:  { bg: "#3a7d44", light: "#e8f5e9", border: "#3a7d44", tag: "#2d6435" },
  earth:  { bg: "#6d4c41", light: "#efebe9", border: "#6d4c41", tag: "#4e342e" },
  blue:   { bg: "#1976d2", light: "#e3f2fd", border: "#1976d2", tag: "#1565c0" },
  purple: { bg: "#6d28d9", light: "#ede9fe", border: "#6d28d9", tag: "#5b21b6" },
  orange: { bg: "#e65100", light: "#fff3e0", border: "#e65100", tag: "#e65100" },
  gray:   { bg: "#607d8b", light: "#eceff1", border: "#607d8b", tag: "#455a64" },
};

const badgeStyle = {
  "Activa":    { bg: "#e8f5e9", color: "#3a7d44" },
  "Borrador":  { bg: "#fef3c7", color: "#92400e" },
  "Piloto":    { bg: "#e3f2fd", color: "#1976d2" },
  "Pronto":    { bg: "#ede9fe", color: "#6d28d9" },
  "Maestro":   { bg: "#e2e3e5", color: "#383d41" },
  "Comunidad": { bg: "#e2e3e5", color: "#383d41" },
};

const typeColors = {
  member:   "#3a7d44",
  support:  "#1976d2",
  external: "#6d4c41",
  group:    "#f59e0b",
  empty:    "#6b7280",
};

const parsePerson = (p) => {
  const parts = (p.name || "").split(" ");
  return {
    ...p,
    id: generateId(),
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    phone: p.phone || "",
    role: p.role || p.detail || "",
  };
};

const INITIAL_MEMBERS = [
  { name: "Maximiliano Contreras", detail: "Comisión de Recursos", type: "member", badge: "Activa" },
  { name: "Lucas Di Stefano",      detail: "Comisión de Recursos", type: "member", badge: "Activa" },
  { name: "Maestro Hector Larrea", detail: "Referente pedagógico", type: "member", badge: "Maestro" },
].map(parsePerson);

const INITIAL_BRANCHES = [
  {
    id: "tienda",
    title: "Diente de León",
    subtitle: "Tienda agroecológica",
    icon: "🌱",
    color: "green",
    people: [
      { name: "Yuliana Longhi", role: "Coordinación General", badge: "Activa", type: "member", phone: "+54 9 3513 64-5612" }
    ].map(parsePerson),
    subBranches: [
      {
        id: "proveedores",
        title: "Proveedores",
        color: "green",
        people: [
          { name: "Maria Martini", role: "Coordinador de Proveedores", badge: "Activa", type: "external" },
          { name: "Pool de familias", role: "Apoyo", badge: null, type: "group" },
        ].map(parsePerson)
      },
      {
        id: "logistica",
        title: "Logística",
        color: "green",
        people: [
          { name: "Anabella Gargiulo", role: "Coordinador de Logística", badge: "Activa", type: "member" },
          { name: "Pool de Logística", role: "Retiro y entrega", badge: null, type: "group" },
        ].map(parsePerson)
      },
      {
        id: "ventas",
        title: "Ventas",
        color: "green",
        people: [
          { name: "— A definir", role: "Coordinador de Ventas", badge: "Pronto", type: "empty" },
        ].map(parsePerson)
      }
    ]
  },
  {
    id: "sef",
    title: "Proyecto SEF",
    subtitle: "SER Económico Fraterno",
    icon: "🤝",
    color: "earth",
    people: [
      { name: "Esteban Próspero", role: "Referente Principal SEF", badge: "Activa", type: "member" },
      { name: "Javier Serra",     role: "Referente SEF", badge: "Borrador", type: "member" },
    ].map(parsePerson)
  },
  {
    id: "digital",
    title: "Soporte Digital",
    subtitle: "Plataformas y herramientas",
    icon: "💻",
    color: "blue",
    people: [
      { name: "Ines Robertson", role: "Soporte Digital", badge: "Piloto", type: "support", phone: "+54 9 3512 11-2050" },
    ].map(parsePerson)
  }
];

function initials(firstName, lastName) {
  const f = firstName ? firstName[0] : "";
  const l = lastName ? lastName[0] : "";
  return (f + l).toUpperCase() || "?";
}

function PersonCard({ person, index, branchId, branchColor, onDragStart, onClick, onDropOnPerson, isEditing }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    onDropOnPerson(e, branchId, index);
  };

  return (
    <div 
      draggable={isEditing}
      onDragStart={(e) => { if (isEditing) onDragStart(e, person, branchId, index); }}
      onClick={(e) => { e.stopPropagation(); if (isEditing) onClick(person, branchId); }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px",
        background: person.type === "empty" ? "#f9f9f9" : "white",
        borderRadius: 8,
        border: `1px solid ${person.type === "empty" ? "#e0e0e0" : "#e0e0e0"}`,
        borderTop: dragOver ? `3px solid ${branchColor}` : undefined,
        opacity: person.type === "empty" ? 0.65 : 1,
        cursor: isEditing ? "grab" : "default",
        transition: "all 0.15s",
        marginTop: dragOver ? 4 : 0,
      }}
      onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
      onMouseOut={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: person.type === "empty" ? "#e0e0e0" : typeColors[person.type] || branchColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>
        {person.type === "group" ? "👥" : person.type === "empty" ? "?" : initials(person.firstName, person.lastName)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {person.firstName} {person.lastName}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{person.role}</div>
      </div>
      {person.badge && (
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
          background: (badgeStyle[person.badge] || { bg: "#eee" }).bg,
          color: (badgeStyle[person.badge] || { color: "#333" }).color,
          flexShrink: 0,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          {person.badge}
        </span>
      )}
    </div>
  );
}

function SubBranch({ subBranch, parentColor, onDragStart, onDropOnBranch, onDropOnPerson, onAddMember, onMemberClick, onEditBranch, isEditing }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div 
      onDragOver={(e) => { if (isEditing) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation(); setDragOver(false); onDropOnBranch(e, subBranch.id); } }}
      style={{
        background: "rgba(255,255,255,0.6)",
        border: "1px dashed #ccc",
        borderRadius: 8,
        padding: "10px",
        marginTop: "10px",
        backgroundColor: dragOver ? "#f0f8ff" : "rgba(255,255,255,0.6)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: parentColor, textTransform: "uppercase" }}>{subBranch.title}</div>
        {isEditing && <button onClick={() => onEditBranch(subBranch)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>⚙️</button>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {subBranch.people?.map((p, i) => (
          <PersonCard key={p.id} person={p} index={i} branchId={subBranch.id} branchColor={parentColor} onDragStart={onDragStart} onClick={onMemberClick} onDropOnPerson={onDropOnPerson} isEditing={isEditing} />
        ))}
        {isEditing && (
        <button 
          onClick={(e) => { e.stopPropagation(); onAddMember(subBranch.id); }}
          style={{ padding: "6px", background: "none", border: `1px dashed ${parentColor}`, borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700, color: parentColor }}
        >
          + Agregar a {subBranch.title}
        </button>
        )}
      </div>
    </div>
  );
}

function BranchCard({ branch, onDragStart, onDropOnBranch, onDropOnPerson, onAddMember, onMemberClick, onEditBranch, onAddSubBranch, isEditing }) {
  const c = COLOR_PALETTE[branch.color] || COLOR_PALETTE.green;
  const [dragOver, setDragOver] = useState(false);
  
  return (
    <div 
      onDragOver={(e) => { if (isEditing) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { if (isEditing) { e.preventDefault(); e.stopPropagation(); setDragOver(false); onDropOnBranch(e, branch.id); } }}
      style={{
        width: "100%", maxWidth: 320,
        border: `1px solid #e0e0e0`,
        borderTop: `4px solid ${c.bg}`,
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column",
        background: "white",
        backgroundColor: dragOver ? "#f0f8ff" : "white",
        margin: "0 auto",
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: `1px solid #e0e0e0`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{branch.icon}</span> {branch.title}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{branch.subtitle}</div>
        </div>
        {isEditing && <button onClick={() => onEditBranch(branch)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>⚙️</button>}
      </div>

      <div style={{ background: c.light, padding: "12px 12px 8px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: c.bg, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Roles y Responsabilidades</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 40 }}>
          {branch.people?.map((p, i) => (
            <PersonCard key={p.id} person={p} index={i} branchId={branch.id} branchColor={c.bg} onDragStart={onDragStart} onClick={onMemberClick} onDropOnPerson={onDropOnPerson} isEditing={isEditing} />
          ))}
          
          {branch.subBranches && branch.subBranches.map(sb => (
            <SubBranch key={sb.id} subBranch={sb} parentColor={c.bg} onDragStart={onDragStart} onDropOnBranch={onDropOnBranch} onDropOnPerson={onDropOnPerson} onAddMember={onAddMember} onMemberClick={onMemberClick} onEditBranch={() => onEditBranch(sb, branch.id)} isEditing={isEditing} />
          ))}

          {isEditing && (
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button 
              onClick={() => onAddMember(branch.id)}
              style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.7)", border: `1px dashed ${c.border}`, borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: c.bg, transition: "background 0.2s" }}
            >
              + Persona
            </button>
            <button 
              onClick={() => onAddSubBranch(branch.id)}
              style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.7)", border: `1px dashed ${c.border}`, borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: c.bg, transition: "background 0.2s" }}
            >
              + Sub-rama
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberModal({ member, branchId, onSave, onDelete, onClose, allMembers }) {
  const [formData, setFormData] = useState(member || { firstName: "", lastName: "", role: "", phone: "", badge: "", type: "member" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSelectExisting = (e) => {
    if (!e.target.value) return;
    const existing = allMembers.find(m => m.id === e.target.value);
    if (existing) {
      setFormData({ ...formData, firstName: existing.firstName, lastName: existing.lastName, role: existing.role, phone: existing.phone, badge: existing.badge, type: existing.type });
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "white", borderRadius: 16, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", color: "#1a1a2e", fontSize: 20 }}>{member ? "Editar rol / persona" : "Nueva persona"}</h3>
        
        {!member && allMembers && allMembers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#3a7d44" }}>Cargar desde existente (Agenda)</label>
            <select onChange={handleSelectExisting} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #c8e6c9", marginTop: 4, outline: "none", backgroundColor: "#e8f5e9" }}>
              <option value="">-- Seleccionar miembro --</option>
              {allMembers.map(m => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.role})</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Nombre</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Apellido</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Rol / Responsabilidad</label>
            <input name="role" value={formData.role} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Teléfono de contacto</label>
            <input name="phone" value={formData.phone} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Estado (Badge)</label>
              <select name="badge" value={formData.badge} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none", backgroundColor: "white" }}>
                <option value="">(Ninguna)</option>
                {Object.keys(badgeStyle).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Tipo Visual</label>
              <select name="type" value={formData.type} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none", backgroundColor: "white" }}>
                <option value="member">Miembro Interno</option>
                <option value="support">Soporte</option>
                <option value="external">Externo</option>
                <option value="group">Grupo de personas</option>
                <option value="empty">Vacante</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid #e0e0e0" }}>
          {member ? (
            <button onClick={() => onDelete(member.id, branchId)} style={{ padding: "10px 16px", background: "#fdecea", color: "#c62828", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Eliminar</button>
          ) : <div />}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "10px 16px", background: "#f7f8fa", color: "#6b7280", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Cancelar</button>
            <button onClick={() => onSave(formData, branchId)} style={{ padding: "10px 20px", background: "#3a7d44", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BranchModal({ branch, parentBranchId, onSave, onDelete, onClose }) {
  const isSubBranch = parentBranchId !== null;
  const [formData, setFormData] = useState(branch || { title: "", subtitle: "", icon: "📁", color: "green", people: [], subBranches: [] });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "white", borderRadius: 16, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
        <h3 style={{ margin: "0 0 20px", color: "#1a1a2e", fontSize: 20 }}>{branch ? "Editar Rama" : (isSubBranch ? "Nueva Sub-rama" : "Nueva Rama")}</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 0.3 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Ícono</label>
              <input name="icon" value={formData.icon} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none", textAlign: "center" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Título</label>
              <input name="title" value={formData.title} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none" }} />
            </div>
          </div>
          {!isSubBranch && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Subtítulo</label>
              <input name="subtitle" value={formData.subtitle} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none" }} />
            </div>
          )}
          {!isSubBranch && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Color de Tema</label>
              <select name="color" value={formData.color} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e0e0", marginTop: 4, outline: "none", backgroundColor: "white" }}>
                {Object.keys(COLOR_PALETTE).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid #e0e0e0" }}>
          {branch ? (
            <button onClick={() => onDelete(branch.id, parentBranchId)} style={{ padding: "10px 16px", background: "#fdecea", color: "#c62828", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Eliminar</button>
          ) : <div />}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "10px 16px", background: "#f7f8fa", color: "#6b7280", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Cancelar</button>
            <button onClick={() => onSave(formData, parentBranchId)} style={{ padding: "10px 20px", background: "#3a7d44", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Organigrama() {
  const [branches, setBranches] = useState(INITIAL_BRANCHES);
  const [mainMembers, setMainMembers] = useState(INITIAL_MEMBERS);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextDbUpdate = useRef(false);

  useEffect(() => {
    const organigramaRef = ref(db, 'organigrama_v1');
    const unsubscribe = onValue(organigramaRef, (snapshot) => {
      const data = snapshot.val();
      skipNextDbUpdate.current = true;
      if (data) {
        setBranches(data.branches || INITIAL_BRANCHES);
        setMainMembers(data.mainMembers || INITIAL_MEMBERS);
      } else {
        setBranches(INITIAL_BRANCHES);
        setMainMembers(INITIAL_MEMBERS);
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (skipNextDbUpdate.current) {
      skipNextDbUpdate.current = false;
      return;
    }
    set(ref(db, 'organigrama_v1'), { branches, mainMembers });
  }, [branches, mainMembers, isLoaded]);

  const [showMembers, setShowMembers] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Extract unique members
  const allMembers = [];
  const addUnique = (m) => {
    if(!allMembers.find(x => x.firstName === m.firstName && x.lastName === m.lastName)) {
      allMembers.push(m);
    }
  };
  mainMembers.forEach(addUnique);
  branches.forEach(b => {
    b.people?.forEach(addUnique);
    b.subBranches?.forEach(sb => {
      sb.people?.forEach(addUnique);
    });
  });

  const handleDragStartBranch = (e, index) => {
    e.dataTransfer.setData("application/branch", JSON.stringify({ index }));
  };

  const handleDropBranchOrder = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.dataTransfer.getData("application/branch");
    if (!data) return;
    const { index: sourceIndex } = JSON.parse(data);
    if (sourceIndex === targetIndex) return;

    setBranches(prev => {
      const newBranches = [...prev];
      const [movedBranch] = newBranches.splice(sourceIndex, 1);
      newBranches.splice(targetIndex, 0, movedBranch);
      return newBranches;
    });
  };

  // Modals state
  const [personModalState, setPersonModalState] = useState(null); // { member, branchId }
  const [branchModalState, setBranchModalState] = useState(null); // { branch, parentBranchId }

  const handleDragStart = (e, person, sourceBranchId, sourceIndex) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ person, sourceBranchId, sourceIndex }));
  };

  const removePersonFromState = (branchId, personId) => {
    if (branchId === "main") {
      setMainMembers(prev => prev.filter(m => m.id !== personId));
      return;
    }
    setBranches(prev => prev.map(b => {
      if (b.id === branchId) {
        return { ...b, people: (b.people || []).filter(m => m.id !== personId) };
      }
      if (b.subBranches) {
        const subIndex = b.subBranches.findIndex(sb => sb.id === branchId);
        if (subIndex > -1) {
          const newSubBranches = [...b.subBranches];
          newSubBranches[subIndex] = { ...newSubBranches[subIndex], people: (newSubBranches[subIndex].people || []).filter(m => m.id !== personId) };
          return { ...b, subBranches: newSubBranches };
        }
      }
      return b;
    }));
  };

  const insertPersonIntoState = (branchId, person, targetIndex) => {
    if (branchId === "main") {
      setMainMembers(prev => {
        const newArr = [...prev];
        if (targetIndex !== undefined) newArr.splice(targetIndex, 0, person);
        else newArr.push(person);
        return newArr;
      });
      return;
    }
    setBranches(prev => prev.map(b => {
      if (b.id === branchId) {
        const newPeople = [...(b.people || [])];
        if (targetIndex !== undefined) newPeople.splice(targetIndex, 0, person);
        else newPeople.push(person);
        return { ...b, people: newPeople };
      }
      if (b.subBranches) {
        const subIndex = b.subBranches.findIndex(sb => sb.id === branchId);
        if (subIndex > -1) {
          const newSubBranches = [...b.subBranches];
          const newPeople = [...(newSubBranches[subIndex].people || [])];
          if (targetIndex !== undefined) newPeople.splice(targetIndex, 0, person);
          else newPeople.push(person);
          newSubBranches[subIndex] = { ...newSubBranches[subIndex], people: newPeople };
          return { ...b, subBranches: newSubBranches };
        }
      }
      return b;
    }));
  };

  const handleDropOnBranch = (e, targetBranchId) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    
    const { person, sourceBranchId } = JSON.parse(data);
    if (sourceBranchId === targetBranchId) return; 
    
    removePersonFromState(sourceBranchId, person.id);
    insertPersonIntoState(targetBranchId, person);
  };

  const handleDropOnPerson = (e, targetBranchId, targetIndex) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const { person, sourceBranchId, sourceIndex } = JSON.parse(data);
    
    if (sourceBranchId === targetBranchId) {
      if (sourceIndex === targetIndex) return;
      removePersonFromState(sourceBranchId, person.id);
      let finalIndex = targetIndex;
      if (sourceIndex < targetIndex) {
        finalIndex -= 1;
      }
      insertPersonIntoState(targetBranchId, person, finalIndex);
    } else {
      removePersonFromState(sourceBranchId, person.id);
      insertPersonIntoState(targetBranchId, person, targetIndex);
    }
  };

  // Person CRUD
  const handleSaveMember = (memberData, branchId) => {
    const isNew = !memberData.id;
    const finalMember = isNew ? { ...memberData, id: generateId() } : memberData;

    if (isNew) {
      insertPersonIntoState(branchId, finalMember);
    } else {
      if (branchId === "main") {
        setMainMembers(prev => prev.map(m => m.id === finalMember.id ? finalMember : m));
      } else {
        setBranches(prev => prev.map(b => {
          if (b.id === branchId) {
            return { ...b, people: (b.people || []).map(m => m.id === finalMember.id ? finalMember : m) };
          }
          if (b.subBranches) {
            const subIndex = b.subBranches.findIndex(sb => sb.id === branchId);
            if (subIndex > -1) {
              const newSubBranches = [...b.subBranches];
              newSubBranches[subIndex] = { ...newSubBranches[subIndex], people: (newSubBranches[subIndex].people || []).map(m => m.id === finalMember.id ? finalMember : m) };
              return { ...b, subBranches: newSubBranches };
            }
          }
          return b;
        }));
      }
    }
    setPersonModalState(null);
  };

  const handleDeleteMember = (memberId, branchId) => {
    removePersonFromState(branchId, memberId);
    setPersonModalState(null);
  };

  // Branch CRUD
  const handleSaveBranch = (branchData, parentBranchId) => {
    const isNew = !branchData.id;
    const finalBranch = isNew ? { ...branchData, id: generateId() } : branchData;

    if (parentBranchId === null) {
      // Main Branch
      if (isNew) {
        setBranches(prev => [...prev, finalBranch]);
      } else {
        setBranches(prev => prev.map(b => b.id === finalBranch.id ? finalBranch : b));
      }
    } else {
      // Sub Branch
      setBranches(prev => prev.map(b => {
        if (b.id === parentBranchId) {
          if (isNew) {
            return { ...b, subBranches: [...(b.subBranches || []), finalBranch] };
          } else {
            return { ...b, subBranches: b.subBranches.map(sb => sb.id === finalBranch.id ? finalBranch : sb) };
          }
        }
        return b;
      }));
    }
    setBranchModalState(null);
  };

  const handleDeleteBranch = (branchId, parentBranchId) => {
    if (parentBranchId === null) {
      setBranches(prev => prev.filter(b => b.id !== branchId));
    } else {
      setBranches(prev => prev.map(b => {
        if (b.id === parentBranchId) {
          return { ...b, subBranches: b.subBranches.filter(sb => sb.id !== branchId) };
        }
        return b;
      }));
    }
    setBranchModalState(null);
  };

  return (
    <div style={{ fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif", background: "#f7f8fa", minHeight: "100vh", padding: "40px 20px" }}>
      <style>
        {`
          .tree-node { position: relative; padding-top: 30px; flex: 1; min-width: 320px; display: flex; flex-direction: column; align-items: center; padding-left: 20px; padding-right: 20px; }
          .tree-node::before { content: ''; position: absolute; top: 0; left: 50%; width: 2px; height: 30px; background: #c8e6c9; transform: translateX(-50%); }
          .tree-node::after { content: ''; position: absolute; top: 0; width: 100%; height: 2px; background: #c8e6c9; }
          .tree-node:first-child::after { left: 50%; width: 50%; }
          .tree-node:last-child::after { right: 50%; width: 50%; }
          .tree-node:first-child:last-child::after { display: none; }
        `}
      </style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div style={{ width: 150 }}></div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e" }}>🌻 Comisión de Recursos</div>
          <div style={{ fontSize: 15, color: "#3a7d44", fontStyle: "italic", marginTop: 4 }}>"Cultivando juntos un futuro consciente"</div>
        </div>
        <div style={{ width: 150, textAlign: "right" }}>
          {isEditing ? (
            <button onClick={() => setIsEditing(false)} style={{ padding: "10px 20px", background: "#3a7d44", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              Guardar estado
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{ padding: "10px 20px", background: "white", color: "#3a7d44", border: "1px solid #3a7d44", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              Editar organigrama
            </button>
          )}
        </div>
      </div>

      <div style={{ position: "relative", paddingBottom: "30px", zIndex: 10 }}>
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDropOnBranch(e, "main")}
          style={{ maxWidth: 820, margin: "0 auto", background: "white", borderRadius: 16, border: "1px solid #e0e0e0", borderTop: "4px solid #3a7d44", padding: "20px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", position: "relative" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Órgano principal</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", marginTop: 4 }}>Miembros de la Comisión</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Supervisión general de todos los proyectos.</div>
            </div>
            <button
              onClick={() => setShowMembers(!showMembers)}
              style={{ background: showMembers ? "#e8f5e9" : "white", color: "#3a7d44", border: "1px solid #3a7d44", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "background 0.2s" }}
            >
              {showMembers ? "Ocultar miembros" : "Ver miembros ▼"}
            </button>
          </div>
          
          {showMembers && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {mainMembers.map((m, i) => (
                  <div 
                    key={m.id} 
                    draggable={isEditing}
                    onDragStart={(e) => { if(isEditing) handleDragStart(e, m, "main", i); }}
                    onDragOver={(e) => { if(isEditing) e.preventDefault(); }}
                    onDrop={(e) => { if(isEditing) handleDropOnPerson(e, "main", i); }}
                    onClick={() => { if(isEditing) setPersonModalState({ member: m, branchId: "main" }); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 24, padding: "6px 16px 6px 6px", border: "1px solid #e0e0e0", cursor: isEditing ? "grab" : "default", transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
                    onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.06)"}
                    onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)"}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#3a7d44", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                      {initials(m.firstName, m.lastName)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.2 }}>{m.firstName} {m.lastName}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              {isEditing && (
              <button 
                onClick={() => setPersonModalState({ member: null, branchId: "main" })}
                style={{ alignSelf: "flex-start", padding: "6px 12px", background: "none", border: "1px dashed #3a7d44", borderRadius: 16, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#3a7d44", marginTop: 4 }}
              >
                + Añadir a Comisión
              </button>
              )}
            </div>
          )}
        </div>
        {/* Vertical line descending from main box */}
        {branches.length > 0 && (
          <div style={{ position: "absolute", bottom: 0, left: "50%", width: "2px", height: "30px", background: "#c8e6c9", transform: "translateX(-50%)" }}></div>
        )}
      </div>

      <div style={{ overflowX: "auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", minWidth: "max-content", margin: "0 auto" }}>
          {branches.map((b, index) => (
            <div 
              key={b.id} 
              className="tree-node"
              draggable={isEditing}
              onDragStart={(e) => { if(isEditing) handleDragStartBranch(e, index); }}
              onDragOver={(e) => { if(isEditing && e.dataTransfer.types.includes("application/branch")) e.preventDefault(); }}
              onDrop={(e) => { if(isEditing && e.dataTransfer.types.includes("application/branch")) handleDropBranchOrder(e, index); }}
              style={{ cursor: isEditing ? "grab" : "default" }}
            >
              <BranchCard 
                branch={b} 
                onDragStart={handleDragStart} 
                onDropOnBranch={handleDropOnBranch} 
                onDropOnPerson={handleDropOnPerson}
                onAddMember={(bId) => setPersonModalState({ member: null, branchId: bId })}
                onMemberClick={(p, branchId) => setPersonModalState({ member: p, branchId })}
                onEditBranch={(branchObj, parentId = null) => setBranchModalState({ branch: branchObj, parentBranchId: parentId })}
                onAddSubBranch={(parentId) => setBranchModalState({ branch: null, parentBranchId: parentId })}
                isEditing={isEditing}
              />
            </div>
          ))}
        </div>
      </div>

      {isEditing && (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
        <button 
          onClick={() => setBranchModalState({ branch: null, parentBranchId: null })}
          style={{ padding: "12px 24px", background: "white", border: "1px dashed #3a7d44", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#3a7d44", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          + Añadir Proyecto/Área
        </button>
      </div>
      )}

      {personModalState && (
        <MemberModal 
          member={personModalState.member} 
          branchId={personModalState.branchId} 
          onSave={handleSaveMember} 
          onDelete={handleDeleteMember} 
          onClose={() => setPersonModalState(null)} 
          allMembers={allMembers}
        />
      )}

      {branchModalState && (
        <BranchModal 
          branch={branchModalState.branch} 
          parentBranchId={branchModalState.parentBranchId} 
          onSave={handleSaveBranch} 
          onDelete={handleDeleteBranch} 
          onClose={() => setBranchModalState(null)} 
        />
      )}
    </div>
  );
}