"use client";

export default function SettingsTab({ passwordForm, setPasswordForm, passwordError, setPasswordError, passwordSuccess, passwordLoading, onPasswordChange, notificationPreferences, setNotificationPreferences, onNotificationChange, onDeleteAccount }) {
 return (
  <div className="bg-white rounded-xl shadow-sm p-6">
   <h2 className="text-2xl font-bold mb-6">Hesap Ayarları</h2>

   <div className="space-y-6">
    <div className="pb-6 border-b">
     <h3 className="font-bold text-lg mb-4">Şifre Değiştir</h3>
     <form onSubmit={onPasswordChange} className="space-y-4">
      <input
       type="password"
       placeholder="Mevcut Şifre"
       value={passwordForm.currentPassword}
       onChange={(e) => {
        setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
        setPasswordError("");
       }}
       className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
       required
      />
      <input
       type="password"
       placeholder="Yeni Şifre"
       value={passwordForm.newPassword}
       onChange={(e) => {
        setPasswordForm({ ...passwordForm, newPassword: e.target.value });
        setPasswordError("");
       }}
       className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
       required
       minLength={6}
      />
      <input
       type="password"
       placeholder="Yeni Şifre Tekrar"
       value={passwordForm.confirmPassword}
       onChange={(e) => {
        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
        setPasswordError("");
       }}
       className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
       required
       minLength={6}
      />
      {passwordError && (
       <p className="text-sm text-red-600">{passwordError}</p>
      )}
      {passwordSuccess && (
       <p className="text-sm text-green-600">{passwordSuccess}</p>
      )}
      <button
       type="submit"
       disabled={passwordLoading}
       className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
       {passwordLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </button>
     </form>
    </div>

    <div className="pb-6 border-b">
     <h3 className="font-bold text-lg mb-4">Bildirim Tercihleri</h3>
     <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
       <input
        type="checkbox"
        checked={notificationPreferences?.emailNotifications ?? false}
        onChange={(e) => onNotificationChange('emailNotifications', e.target.checked)}
        className="w-5 h-5 cursor-pointer"
       />
       <span className="text-gray-700">E-posta bildirimleri al</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
       <input
        type="checkbox"
        checked={notificationPreferences?.campaignNotifications ?? false}
        onChange={(e) => onNotificationChange('campaignNotifications', e.target.checked)}
        className="w-5 h-5 cursor-pointer"
       />
       <span className="text-gray-700">Kampanya ve fırsat bildirimlerini al</span>
      </label>
     </div>
    </div>

    <div>
     <h3 className="font-bold text-lg mb-2 text-red-600">Tehlikeli Bölge</h3>
     <p className="text-sm text-gray-600 mb-4">
      Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir.
     </p>
     <button
      onClick={onDeleteAccount}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
     >
      Hesabı Sil
     </button>
    </div>
   </div>
  </div>
 );
}
