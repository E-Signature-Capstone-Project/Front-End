import { useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
=======
import { Link } from "react-router-dom";
>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const navigate = useNavigate();
=======
>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }
<<<<<<< HEAD
    
    // TAMBAHKAN INI: Simpan data ke localStorage
    localStorage.setItem('token', 'demo-token-12345');
    localStorage.setItem('userEmail', email);
    
    // Login berhasil, redirect ke baseline
    navigate("/baseline");
=======
    alert(`Login berhasil!\nEmail: ${email}`);
    setError("");
>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6
  };

  return (
    <div className="flex min-h-screen">
<<<<<<< HEAD
      <aside className="w-1/5 bg-[#AD1F10] flex flex-col items-start py-8 px-8 text-white">
=======
      <aside className="w-1/3 bg-[#AD1F10] flex flex-col items-start py-8 px-8 text-white">
>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6
        <h1 className="text-3xl font-bold mb-4">E-Signature</h1>
        <p className="font-semibold text-lg mb-1">E-Signature System</p>
        <p className="text-sm opacity-90">Fast • Secure • Paperless</p>
      </aside>

      <main className="w-2/3 flex flex-col items-center justify-center bg-[#E6E6E6] p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Please Log in</h2>

          <form className="bg-white p-8 rounded-lg shadow-md space-y-6" onSubmit={handleLogin}>
            <div className="relative">
              <input
                type="text"
                placeholder="Email / Username"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
<<<<<<< HEAD
=======
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6
            </div>

            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
<<<<<<< HEAD
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

=======
              type="button"
               onClick={() => setPasswordVisible(!passwordVisible)}
               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
               >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6
            <div className="flex justify-end">
              <a href="#" className="text-sm text-gray-700 hover:underline">
                Forgot Password ?
              </a>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-[#AD1F10] text-white px-8 py-2 rounded-md font-medium shadow hover:bg-[#660000] transition-colors"
              >
                Log In
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-gray-900 text-center">
            Do not have an account?{" "}
            <Link to="/register" className="font-semibold hover:underline text-[#AD1F10]">
              Sign Up now
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 6cd94f456933ce04e0c990466642c9cc92f3b3f6
