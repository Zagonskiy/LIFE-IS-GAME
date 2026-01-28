import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Состояние для формы регистрации
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Следим за авторизацией
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Слушаем изменения данных пользователя в реальном времени
        onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
          setUserData(doc.data());
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Кнопка "Запомнить меня"
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        username: username,
        balance: 1000, // Стартовый баланс
        avatarUrl: 'https://via.placeholder.com/150'
      });
    } catch (err) { alert(err.message); }
  };

  const updateProfile = async (newNick, file) => {
    const userRef = doc(db, "users", user.uid);
    if (file) {
      const fileRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateDoc(userRef, { avatarUrl: url });
    }
    if (newNick) await updateDoc(userRef, { username: newNick });
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-blue-50">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#F0F9FF] font-sans text-slate-700">
      {!user ? (
        /* ЭКРАН РЕГИСТРАЦИИ */
        <div className="flex items-center justify-center h-screen p-4">
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-md border border-white">
            <h1 className="text-3xl font-bold text-[#0EA5E9] mb-6 text-center">LIFE IS GAME</h1>
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="text" placeholder="Никнейм" className="w-full p-3 rounded-xl bg-blue-50 border-none outline-sky-300" onChange={e => setUsername(e.target.value)} />
              <input type="email" placeholder="Email" className="w-full p-3 rounded-xl bg-blue-50 border-none outline-sky-300" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Пароль" className="w-full p-3 rounded-xl bg-blue-50 border-none outline-sky-300" onChange={e => setPassword(e.target.value)} />
              
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded text-sky-400" />
                <span>Запомнить меня</span>
              </label>

              <button className="w-full bg-[#7DD3FC] hover:bg-[#38BDF8] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-200">
                Начать игру
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ГЛАВНЫЙ ЭКРАН */
        <div className="flex flex-col md:flex-row h-screen">
          {/* Sidebar для ПК / Topbar для мобилок */}
          <nav className="bg-white/50 backdrop-blur-md w-full md:w-64 p-6 border-b md:border-r border-sky-100 flex md:flex-col justify-between items-center md:items-start">
            <h2 className="text-xl font-black text-[#0EA5E9]">LIG.</h2>
            
            <div className="hidden md:block space-y-4 mt-10">
              <div className="p-3 bg-sky-100 rounded-lg text-sky-700 font-semibold">🏠 Главная</div>
              <div className="p-3 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer">💼 Подработки</div>
              <div className="p-3 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer">🏢 Бизнес</div>
            </div>

            <button onClick={() => auth.signOut()} className="text-sm text-red-400 hover:text-red-600">Выйти</button>
          </nav>

          {/* Контент */}
          <main className="flex-1 p-4 md:p-10 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Карточка профиля и баланса */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#7DD3FC] to-[#0EA5E9] p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
                  <p className="opacity-80">Ваш баланс</p>
                  <h3 className="text-4xl font-bold">${userData?.balance?.toLocaleString()}</h3>
                  <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center space-x-4 border border-sky-50">
                  <img src={userData?.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                  <div>
                    <h4 className="text-xl font-bold">{userData?.username}</h4>
                    <p className="text-gray-400 text-sm">Статус: Новичок</p>
                    <button className="mt-2 text-xs text-sky-500 underline" onClick={() => {
                      const n = prompt("Новый ник:", userData.username);
                      if(n) updateProfile(n, null);
                    }}>Изменить профиль</button>
                  </div>
                </div>
              </div>

              {/* Сетка подработок (адаптивная) */}
              <h3 className="text-xl font-bold mt-10">Доступные действия</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Курьер', 'Фриланс', 'Завод'].map((job) => (
                  <div key={job} className="bg-white p-6 rounded-3xl text-center border border-sky-50 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-sky-100 rounded-full mx-auto mb-3 flex items-center justify-center">📦</div>
                    <span className="font-semibold">{job}</span>
                  </div>
                ))}
              </div>

            </div>
          </main>
          
          {/* Нижняя навигация только для мобилок */}
          <div className="md:hidden fixed bottom-0 w-full bg-white/80 backdrop-blur-lg border-t border-sky-100 flex justify-around p-4">
            <button className="text-2xl">🏠</button>
            <button className="text-2xl opacity-40">💼</button>
            <button className="text-2xl opacity-40">👤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
