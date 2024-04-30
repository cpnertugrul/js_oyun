
// canvas oluşturuldu ve gerekli ayarlamalar yapıldı 
const startdiv=document.getElementById("start");
const btn=document.querySelector("#start button");
const p=document.querySelector("#start p");
const killsdiv=document.getElementById('kills');
const scorediv=document.getElementById('score');
const canvas = document.getElementById('canvas');
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');
// Oyunu başlattığımızda Başlat butonunun bulunduğu pencerinin gidip bizi oyunumuza başlatan fonksiyon
window.onload=function(){
  startdiv.classList.remove("hidden");
};


// Mermileri,hedef sayılarını,max hedef sayısını,score ve imha edilen hedef sayılarını saklayan global bir dizi
let bullets = [];
let enemies=[];
let maxenemies=1;
let playing=true;
let score=0;
let kills=0;
startdiv.classList.add("hidden")
// F35 Uçak sınıfı
class Ucak {
  constructor(ctx) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.x = this.width / 2; // Uçağın X koordinatı
    this.y = this.height / 2; // Uçağın Y koordinatı
    this.angle = 0; // Uçağın dönme açısı
    this.r=30;
} //F35 i çizmek için gereken metotlar
  ciz() {
    this.ctx.save(); // Mevcut çizim durumunu kaydet
    this.ctx.translate(this.x, this.y); // Dönme merkezini uçağın konumuna taşı
    this.ctx.rotate(this.angle * Math.PI / 180); // Uçağı döndür
  
    // Uçağın gövdesi
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0); // Uçağın merkezi
    this.ctx.lineTo(-40, -30);
    this.ctx.lineTo(0, -60);
    this.ctx.lineTo(40, -30);
    this.ctx.closePath();
    this.ctx.fillStyle = '#0B60B0';
    this.ctx.fill();
  
    // Uçağın kanatları
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0); // Uçağın merkezi
    this.ctx.lineTo(-50, 30);
    this.ctx.lineTo(-50, 10);
    this.ctx.lineTo(0, -30);
    this.ctx.closePath();
    this.ctx.fillStyle = '#0B60B0';
    this.ctx.fill();
  
    this.ctx.beginPath();
    this.ctx.moveTo(0, -60);
    this.ctx.lineTo(-50, -90);
    this.ctx.lineTo(-50, -70);
    this.ctx.lineTo(0, -30);
    this.ctx.closePath();
    this.ctx.fillStyle = '#0B60B0';
    this.ctx.fill();
  
    this.ctx.restore(); // Çizim durumunu geri yükle
    
}
  //F35 in açısını güncelleme fonksiyonu
  guncelle(mesafex, mesafey) {
    var alfa = Math.atan2(mesafey, mesafex);
    this.angle = alfa * 180 / Math.PI;
  }
} //Oyunu başlatmak için gereken fonksiyon ve ayrıca oyunun kybedilmesi ya da başlamasını ayarlamaya yarayan playing değişkeni
function oyunuBaslat(){
  playing=true;
  score=0;
  kills=0;
  maxenemies=1;
  enemies=[];
  bullets=[];
  startdiv.classList.add("hidden");
  animasyon();

}//oyun başlatma butonuna tıklanıp oyunun başlaması için gerekn olay
btn.addEventListener('click',oyunuBaslat);
// F35 nesnesi oluşturuldu
const ucak = new Ucak(ctx);
// Mouse hareketlerine göre uçağın dönmesini sağlayan olay işleyicisi
canvas.addEventListener('mousemove', (e) => {
  if(playing){
    var mesafex = e.clientX - ucak.x;
  var mesafey = e.clientY - ucak.y;
  ucak.guncelle(mesafex, mesafey);

  }
  
});
canvas.addEventListener('click', (e) => {
  // Uçağın merkezinden ve uçağın dönme açısına göre mermi yarat
  let angleRadians = ucak.angle * Math.PI / 180;
  let bulletVelocityX = Math.cos(angleRadians) * 5;
  let bulletVelocityY = Math.sin(angleRadians) * 5;
  bullets.push(new Daire(ucak.x, ucak.y, bulletVelocityX, bulletVelocityY, 5, 'red'));
});//hedefleri oluşturan daire isimli metot
class Daire {
  constructor(bx, by, vx, vy, r, c) {
    this.bx = bx;
    this.by = by;
    this.vx = vx;
    this.vy = vy;
    this.r = r;
    this.c = c;
    this.x = bx; // Mermi başlangıç X koordinatı
    this.y = by; // Mermi başlangıç Y koordinatı
  }//hedefleri çizmek için gereken fonksiyon
  ciz_2() {
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }//hedeflerin konumunu güncelleme metodu
  update() {
    // Mermiyi uçağın dönme açısına göre hareket ettir
    this.x += this.vx;
    this.y += this.vy;
  }//dairenin canvas içine çıkıp çıkmamasını kontrol eden fonksiyon
  remove() {
    return (this.x < 0 || this.x > width) || (this.y < 0 || this.y > height);
  }
}
// Düşman ekleme fonksiyonu burada düşmanların hızı hangi yönlerden geleceği düşmanların rengi koyuluğu parlaklığı pastel tonlaması gibi düzenlemeler yapılmıştır
function Dusman_ekle() {
    for (var i = enemies.length; i < maxenemies; i++) {
      var r = Math.random() * 30 + 10;
      var c = 'hsl(' + (Math.random() * 360) + ',40%,50%)';
      var s = .25+ ((40 - ((r / 40) * r)) / 160) / maxenemies;
  
      var x, y, vx, vy;
      if (Math.random() < .5) {
        x = (Math.random() > .5) ? width : 0;
        y = Math.random() * height;
      } else {
        x = Math.random() * width;
        y = (Math.random() < .5) ? height : 0;
      }
      
      // Uçağa doğru hareket etmek için vx ve vy değerlerini hesapla
      var angleRadians = Math.atan2(ucak.y - y, ucak.x - x);
      vx = Math.cos(angleRadians) * s;
      vy = Math.sin(angleRadians) * s;
  
      enemies.push(new Daire(x, y, vx, vy, r, c));
    }
  }//çarpışma kontrol testi normalde F35 in yarı çapı olmaz ancak karşılaştırmak için F35 e bi yarıçap verdim bu sayede çarpışma testi kolaylaştırıldı 
  function collision(x1,y1,r1,x2,y2,r2){
var dx=x1-x2;
var dy=y1-y2;
var hp=Math.sqrt(dx*dx+dy*dy);
return hp<(r1+r2);
    
}
   
// Animasyon fonksiyonu burada ayrıca oyun kontrolü(playing) yapılmakta olup oyun durumuna göre ekrana bildirilecek ifadeler eklenmiştir
function animasyon() {
    if (playing) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas'ı temizle
  
      // Düşmanları güncelle ve çiz burada level mantığıyla düşmanların  sayısı artırılmış maxenemies sayısı ile tekrar oyun başladığında en baştan başlaması sağlanmış ve ayrıca burda scorlama ve imha edilen füze sayısı hesaplaması yapılmıştır
      enemies.forEach((enemy, index) => {
        bullets.forEach((bullet, b) => {
          if (collision(enemy.x, enemy.y, enemy.r, bullet.x, bullet.y, bullet.r)) {
            if (enemy.r < 15) {
              enemies.splice(index, 1);
              score += 25;
              kills +=1;
              if(kills % 5===0){
                maxenemies++;
              }
              Dusman_ekle();
            } else {
              enemy.r -= 5;
              score += 5;
            }
            bullets.splice(b, 1);
          }
        });
        if (collision(enemy.x, enemy.y, enemy.r, ucak.x, ucak.y, ucak.r)) {
          playing = false; // Eğer düşman uçağa çarparsa oyunu durdur
          startdiv.classList.remove("hidden");
          btn.textContent="TEKRAR DENE";
          p.innerHTML="Oyun Bitti ! <br/> Puanın:"+score;
          maxenemies=1;
        }
        if (enemy.remove()) {
          enemies.splice(index, 1);
          Dusman_ekle();
        }
        enemy.update();
        enemy.ciz_2();
      });
  
  
      // Uçağı çiz
      ucak.ciz();
  
      // Mermileri güncelle ve çiz
      bullets = bullets.filter(bullet => {
        bullet.update();
        bullet.ciz_2();
        return !bullet.remove();
      });
  
      // Puanı güncelle
      scorediv.innerHTML = "Puan: " + score;
      killsdiv.innerHTML = "İmha Edilen Füze: " + kills;
  
      Dusman_ekle();
    }
    requestAnimationFrame(animasyon); // Bir sonraki çerçeve için animasyonu sıraya al
  }
  
  requestAnimationFrame(animasyon); // Animasyonu başlat
  