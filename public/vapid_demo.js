let convertedVapidKey, subscription;
(async _ => {
    try {
        // サービスワーカー登録
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        let tmpVapidKeys = sessionStorage.getItem('vapidKeys');
        let vapidKeys;
        if (!tmpVapidKeys) {
          await registration.pushManager.getSubscription().then((subscription)=>{
            if (subscription) {
              subscription.unsubscribe().then((successful) => {
                console.log("unsubscribe");
              }).catch((e) => {
                console.log("faild unsubscribe");
              });
            }
          });
          // サーバー側で生成したパブリックキーを取得し、urlBase64ToUint8Array()を使ってUit8Arrayに変換
          const res = await fetch('/key');
          tmpVapidKeys = await res.text();
        }
        vapidKeys = JSON.parse(tmpVapidKeys);
        sessionStorage.setItem('vapidKeys', tmpVapidKeys);
        const vapidPublicKey = vapidKeys.vapidPublicKey;
        convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        // (変換した)パブリックキーをapplicationServerKeyに設定してsubscribe
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });
        sessionStorage.setItem('vapidSubscription', JSON.stringify(subscription));
        // 通知の許可を求める
        Notification.requestPermission(permission => {
            console.log(permission); // 'default', 'granted', 'denied'
        });
    } catch (err) {
        console.log(err);
    }
})();
btnWebPushTest.onclick = async evt => {
    if (!subscription) return console.log('sbuscription is null');
    let myPayload = {
      vapidKeys : sessionStorage.getItem("vapidKeys"),
      vapidSubscription : sessionStorage.getItem("vapidSubscription"),
      title: wpTitle.value,
      body: wpBody.value,
      url: wpUrl.value,
      icon: wpIcon.value,
    }
    await fetch('/webpushtest', {
        method: 'POST',
        body: JSON.stringify(myPayload),
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
