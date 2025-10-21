import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    alert(`Login berhasil!\nEmail: ${email}`);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#111] p-6">
      <div className="max-w-full h-[calc(100vh-48px)] bg-white mx-auto overflow-hidden">
        <div className="h-full flex">

          {/* Sidebar */}
          <aside className="w-1/3 bg-[#AD1F10] flex flex-col items-start py-8 px-8 text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-white/30" />
              <h1 className="text-2xl font-bold">E-Signature</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <img
                alt="E-Signature Illustration"
                className="w-4/5 max-w-[200px] h-auto"
              />
              <div className="font-semibold text-lg">E-Signature System</div>
              <div className="text-sm opacity-90">Fast • Secure • Paperless</div>
            </div>
          </aside>

          {/* Main Login */}
          <main className="w-2/3 flex flex-col items-center justify-between relative">
            <div className="w-full flex flex-col items-center justify-start pt-24 px-8">
              <h2 className="text-2xl font-bold mb-8">Please Log in</h2>

              <div className="bg-[#E6E6E6] p-8 w-[600px] max-w-[90%] rounded-sm shadow-md">
                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="bg-white rounded-lg px-4 py-3 flex items-center shadow-sm">
                    <input
                      type="text"
                      placeholder="Email / Username"
                      className="flex-1 ml-1 outline-none text-base bg-transparent"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="bg-white rounded-lg px-4 py-3 flex items-center shadow-sm">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Password"
                      className="flex-1 ml-1 outline-none text-base bg-transparent"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((s) => !s)}
                      className="ml-3 w-7 h-7 rounded-md bg-gray-200 flex items-center justify-center"
                    >
                      {passwordVisible ? "✓" : " "}
                    </button>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <div className="flex justify-end">
                    <a href="#" className="text-sm text-gray-700 hover:underline">
                      Forgot Password ?
                    </a>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="bg-white text-black px-8 py-2 rounded-md font-medium shadow"
                    >
                      Log In
                    </button>
                  </div>
                </form>
              </div>

              <p className="mt-12 text-sm text-gray-700 text-center">
                Do not have an account?{" "}
                <a href="#" className="font-semibold hover:underline">
                  Sign Up now
                </a>
              </p>
            </div>

            <div style={{ height: 24 }} />
          </main>
        </div>
      </div>
    </div>
  );
}
