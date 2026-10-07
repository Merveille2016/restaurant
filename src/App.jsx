import { useState, useEffect } from 'react'
import './App.css'
import Menu from './Menu'

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showNav, setShowNav] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Handle loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Handle sticky navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowNav(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Show loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Mialine Gifted Hands</div>
      </div>
    );
  }

  // 4. Show Menu page if selected
  if (currentPage === 'menu') {
    return <Menu goHome={() => setCurrentPage('home')} />;
  }

  // 5. Data for Image Gallery (UPDATE THESE NAMES TO MATCH YOUR PICTURES)
  const galleryImages = [
    { src: "img/achu.jpg", title: "Achu & Yellow Soup" },
    { src: "img/waterfufu aand eru.jpg", title: "Fufu & Eru" },
    { src: "img/friedrice and chicken.jpg", title: "Fried Rice & Chicken" },
    { src: "img/ekwang.jpg", title: "Ekwang" },
    { src: "img/ogbono soup.jpg", title: "Ogbono Soup" },
    { src: "img/ndole.jpg", title: "Ndole & Yam" }
  ];

  // 6. Data for Testimonials
  const testimonials = [
    {
      text: "The best Achu I've ever tasted! Mialine Gifted Hands truly lives up to their name. The flavors are authentic and the portions are generous.",
      author: "Marie K.",
      stars: 5
    },
    {
      text: "I order from them every week for my office. The delivery is always on time and the food is consistently delicious. Highly recommended!",
      author: "Jean-Pierre T.",
      stars: 5
    },
    {
      text: "Finally found a place that serves real Cameroonian cuisine in Yaoundé. The Eru and Fufu remind me of home. Absolutely fantastic!",
      author: "Amina B.",
      stars: 5
    }
  ];

  return (
    <div className="restaurant-homepage">
      
      {/* STICKY NAVIGATION */}
      <nav className={`sticky-nav ${showNav ? 'visible' : ''}`}>
        <div className="nav-logo">Mialine Gifted Hands</div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => setCurrentPage('menu')}>Menu</span>
          <a href="#gallery" className="nav-link">Gallery</a>
          <a href="#testimonials" className="nav-link">Reviews</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Mialine Gifted Hands</h1>
          <p>Authentic African Cuisine, Crafted with Passion & Precision</p>
          <button className="order-button" onClick={() => setCurrentPage('menu')}>
            Explore Our Menu
          </button>
        </div>
      </section>

      {/* SPECIAL OFFERS BANNER */}
      <section className="special-offers">
        <h2>Today's Specials</h2>
        <div className="offers-grid">
          <div className="offer-card">
            <h3>🔥 Lunch Deal</h3>
            <p>Any main dish + drink for just 2000 FCFA (Mon-Fri, 11AM-3PM)</p>
          </div>
          <div className="offer-card">
            <h3>🎉 Family Pack</h3>
            <p>Feed 4 people with our special family bundle - Save 500 FCFA!</p>
          </div>
          <div className="offer-card">
            <h3>🛵 Free Delivery</h3>
            <p>Free delivery on orders above 5000 FCFA within Obili area</p>
          </div>
        </div>
      </section>

      {/* WELCOME SECTION */}
      <section className="welcome-section">
        <h2>A Taste of Home</h2>
        <p>
          Welcome to Mialine Gifted Hands, where tradition meets culinary excellence. 
          From our rich, savory Achu and Eru to our perfectly spiced Mbongo, every dish 
          is prepared daily using the freshest local ingredients. Whether you are dining 
          with us, or enjoying our convenient home and office delivery, we promise an 
          unforgettable dining experience.
        </p>
      </section>

      {/* IMAGE GALLERY */}
      <section id="gallery" className="gallery-section">
        <h2>Our Delicious Creations</h2>
        <div className="gallery-grid">
          {galleryImages.map((img, index) => (
            <div key={index} className="gallery-item">
              <img src={img.src} alt={img.title} />
              <div className="gallery-overlay">
                <span>{img.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                {'★'.repeat(testimonial.stars)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <p className="testimonial-author">- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <div id="contact" className="contact-section">
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
                  💬 671 131 006
                </a>
                <a href="https://wa.me/237672464364" className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
                  💬 672 464 364
                </a>
              </div>
            </p>
          </div>
        </div>
      </div>

      {/* GOOGLE MAPS */}
      <section className="map-section">
        <h2>Find Us</h2>
        <div className="map-container">
                   <iframe 
            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Carrefour+Obili+Yaounde+Cameroon&zoom=15"
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            title="Mialine Gifted Hands Location - Carrefour Obili">
          </iframe>
        </div>
      </section>

    </div>
  )
}

export default App