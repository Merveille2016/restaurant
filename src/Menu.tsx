import './App.css'

export default function Menu({ goHome }) {
  const dailyMeals = [
    {
      day: "Monday",
      image: "img/achu.jpg",
      meals: ["Achu / Taro", "Fufu and Eru", "Fried Rice and Chicken", "Fufu Corn and Khati Khati"]
    },
    {
      day: "Tuesday",
      image: "img/ekwang.jpg",
      meals: ["Achu / Taro", "Fufu and Eru", "Fried Rice and Chicken", "Fufu Corn and Khati Khati", "Ekwang"]
    },
    {
      day: "Wednesday",
      image: "img/okro.jpg",
      meals: ["Achu / Taro", "Fufu and Eru", "Banana Malaxèe", "Ogbono Soup and Garri or Fufu"]
    },
    {
      day: "Thursday",
      image: "img/friedrice and chicken.jpg",
      meals: ["Achu / Taro", "Fufu and Eru", "Fried Rice and Chicken", "Ogbono Soup", "Ekwang", "Fried Plantain and Chicken"]
    },
    {
      day: "Friday",
      image: "img/ndole.jpg",
      meals: ["Achu / Taro", "Fufu and Eru", "Fried Rice and Chicken", "Ndole and Yam", "Fufu Corn and Khati Khati"]
    },
    {
      day: "Saturday",
      image: "img/snails.jpg",
      meals: ["Achu / Taro", "Fufu and Eru", "Fried Rice and Chicken", "Fufu Corn and Khati Khati", "Nyamagoro"]
    },
    {
      day: "Sunday",
      image: "img/rice and stew.jpg",
      meals: ["Achu / Taro", "Fufu Corn and Khati Khati", "Fufu and Eru", "Bushmeat and Rice", "Fried Rice and Chicken"]
    },
    {
      day: "Monday",
      image: "img/waterfufu aand eru.jpg",
      meals: ["Achu / Taro", "Fufu and Eru", "Fried Rice and Chicken", "Fufu Corn and Khati Khati"]
    },
    {
      day: "Wednesday",
      image: "img/ogbono soup.jpg",
      meals: ["Achu / Taro", "Fufu and Eru", "Banana Malaxèe", "Ogbono Soup and Garri or Fufu"]
    }
  ];

  const fullMenu = [
    "Fried Rice", "Eru and Fufu/Garri", "Ekwang", "White Beans and Rice/Dodo",
    "Achu / Yellow Soup / Black Soup", "Okro Soup / Garri", "Snails / Rice / Dodo",
    "Ogbono Soup Garri", "Hotpot", "Irish", "Porridge Cocoyam", "Bush Meat",
    "Pepper Soup", "Liver Sauce / Rice / Ripe Plantain", "Goat Meat",
    "Fried Fish / Dodo", "Fried Chicken / Irish / Dodo", "Beefsteak / Irish / Dodo",
    "Fried Pork / Irish / Dodo", "Kum Kum and Egusi Soup", "Sea Food",
    "Ogkomobong and Plantain", "Mbongo / Rice / Plantain"
  ];

  const drinks = [
    { name: "Castel Beer", price: "800 FCFA", image: "img/castel.jpg" },
    { name: "33 Export", price: "800 FCFA", image: "img/33 export.jpg" },
    { name: "Mutzig", price: "800 FCFA", image: "img/muzig.jpg" },
    { name: "Beaufort Light/Ordinaire", price: "800 FCFA", image: "img/beaufort.jpg" },
    { name: "Kadji", price: "800 FCFA", image: "img/kadji.jpg" },
    { name: "Doppel Beer", price: "800 FCFA", image: "img/doppel.jpg" },
    { name: "Guinness Smooth", price: "1000 FCFA", image: "img/smooth.jpg" },
    { name: "Petit Guinness", price: "900 FCFA", image: "img/small guiness.jpg" },
    { name: "Grand Guinness", price: "1400 FCFA", image: "img/grand guiness.jpg" },
    { name: "Malta", price: "750 FCFA", image: "img/malta.jpg" },
    { name: "Smirnoff", price: "800 FCFA", image: "img/ice.jpg" },
    { name: "Vimto", price: "1000 FCFA", image: "img/vimto.jpg" },
    { name: "Orangina", price: "1000 FCFA", image: "img/orangina.jpg" },
    { name: "Djino", price: "750 FCFA", image: "img/njino.jpg" },
    { name: "Big Juice", price: "600 FCFA", image: "img/big.jpg" },
    { name: "Water", price: "500 FCFA", image: "img/water.jpg" }
  ];

  return (
    <div className="menu-page">
      <div className="menu-header">
        <button className="back-button" onClick={goHome}>← Back to Home</button>
        <h1>Our Menu</h1>
        <p>Authentic flavors, cooked daily with gifted hands.</p>
      </div>

      <h2 className="section-title">Daily Specials</h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '40px' }}>
        Prices range from <strong style={{ color: '#1B4332' }}>1000 FCFA</strong> to <strong style={{ color: '#1B4332' }}>2500 FCFA</strong> depending on your selection
      </p>
      <div className="daily-specials-grid">
        {dailyMeals.map((dayData, index) => (
          <div key={index} className="day-card">
            <img src={dayData.image} alt={dayData.day} className="day-card-image" />
            <div className="day-card-content">
              <h2>{dayData.day}</h2>
              <ul>
                {dayData.meals.map((meal, mealIndex) => (
                  <li key={mealIndex}>{meal}</li>
                ))}
              </ul>
              <p style={{ marginTop: '15px', color: '#1B4332', fontWeight: 'bold', fontSize: '0.95rem' }}>
                1000 - 2500 FCFA
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="full-menu-section">
        <h2 className="section-title">Full Menu</h2>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
          Prices range from <strong style={{ color: '#1B4332' }}>1000 FCFA</strong> to <strong style={{ color: '#1B4332' }}>2500 FCFA</strong>
        </p>
        <div className="menu-tags">
          {fullMenu.map((item, index) => (
            <span key={index} className="menu-tag">{item}</span>
          ))}
        </div>
      </div>

      <h2 className="section-title">Drinks</h2>
      <div className="drinks-grid">
        {drinks.map((drink, index) => (
          <div key={index} className="drink-card">
            <img src={drink.image} alt={drink.name} className="drink-image" />
            <div className="drink-content">
              <h3>{drink.name}</h3>
              <p>{drink.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-section">
        <h2>Visit Us</h2>
        <p className="contact-subtitle">We're here to serve you delicious meals every day</p>
        
        <div className="contact-grid">
          <div className="contact-card">
            <span className="contact-icon">🕐</span>
            <h3>Opening Hours</h3>
            <p>
              <strong>Monday - Sunday</strong><br/>
              7:00 AM - 11:00 PM<br/>
              <span className="delivery-badge">Open 7 Days</span>
            </p>
          </div>

          <div className="contact-card">
            <span className="contact-icon">📍</span>
            <h3>Our Location</h3>
            <p>
              <strong>Carrefour Obili</strong><br/>
              Yaoundé, Cameroon<br/>
              <span className="delivery-badge">Easy Access</span>
            </p>
          </div>

          <div className="contact-card">
            <span className="contact-icon">🛵</span>
            <h3>Order Now</h3>
            <p>
              <strong>Delivery Service</strong><br/>
              Home | Office | Anywhere<br/>
              <div className="whatsapp-buttons">
                <a href="https://wa.me/237671131006" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
                  <span>💬</span>
                  671 131 006
                </a>
                <a href="https://wa.me/237672464364" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
                  <span>💬</span>
                  672 464 364
                </a>
              </div>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}