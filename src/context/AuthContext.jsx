import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USERS = [
  {
    id: 'u-1',
    nombre: 'Lily García',
    email: 'lily@correo.mx',
    password: '123',
    telefono: '5512345678',
    puntos: 1240,
    nivel: 'Cliente Premium',
  },
];

const cleanPhone = (tel) => (tel ? String(tel).replace(/\D/g, '').slice(0, 10) : '');

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('5a-users');
      const list = saved ? JSON.parse(saved) : DEFAULT_USERS;
      return list.map((u) => ({ ...u, telefono: cleanPhone(u.telefono) }));
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('5a-current-user');
      if (saved === 'null' || saved === '') return null;
      const u = saved ? JSON.parse(saved) : null;
      return u ? { ...u, telefono: cleanPhone(u.telefono) } : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('5a-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('5a-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.setItem('5a-current-user', 'null');
    }
  }, [currentUser]);

  const login = (email, password) => {
    const userWithEmail = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!userWithEmail) {
      return { success: false, message: 'No existe ninguna cuenta registrada con este correo.' };
    }

    if (userWithEmail.password !== password) {
      return { success: false, message: 'Contraseña incorrecta. Inténtalo de nuevo.' };
    }

    setCurrentUser(userWithEmail);
    return { success: true, user: userWithEmail };
  };

  const register = ({ nombre, email, password, telefono }) => {
    const exists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return { success: false, message: 'Ya existe una cuenta registrada con este correo.' };
    }
    const newUser = {
      id: `u-${Date.now()}`,
      nombre: nombre.trim(),
      email: email.trim(),
      password,
      telefono: telefono.trim(),
      puntos: 100, // Bono de bienvenida
      nivel: 'Cliente Nuevo',
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = (fields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...fields };
    if (fields.telefono !== undefined) {
      updated.telefono = cleanPhone(fields.telefono);
    }
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
