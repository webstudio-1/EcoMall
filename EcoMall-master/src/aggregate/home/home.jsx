import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Curseol1 from "./Banner-1.jpg";
import Curseol2 from "./Banner-2.jpg";
import Curseol3 from "./Banner-3.jpg";
import Curseol4 from "./Banner-4.jpg";

const Home = () => {
  // Initialize carousel with autoplay
  useEffect(() => {
    const myCarousel = document.querySelector('#ecoCarousel');
    const carousel = new window.bootstrap.Carousel(myCarousel, {
      interval: 3000, // 3 seconds delay
      ride: 'carousel',
      wrap: true,
      touch: true
    });

    // Pause on hover
    myCarousel.addEventListener('mouseenter', () => {
      carousel.pause();
    });

    // Resume on mouse leave
    myCarousel.addEventListener('mouseleave', () => {
      carousel.cycle();
    });

    // Cleanup
    return () => {
      myCarousel.removeEventListener('mouseenter', () => carousel.pause());
      myCarousel.removeEventListener('mouseleave', () => carousel.cycle());
    };
  }, []);

  return (
    <div 
      id="ecoCarousel" 
      className="carousel slide carousel-fade" 
      data-bs-ride="carousel"
      data-bs-interval="3000"
      data-bs-pause="hover"
    >
      {/* Indicators */}
      {/* <div className="carousel-indicators">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#ecoCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? "active" : ""}
            aria-current={index === 0 ? "true" : "false"}
            aria-label={Slide ${index + 1}}
          ></button>
        ))}
      </div> */}

      <div className="carousel-inner">
        <div className="carousel-item active">
          <img
            src={Curseol1}
            className="d-block w-100"
            alt="Eco Product 1"
            style={{ height: "650px", objectFit: "cover" }}
          />
        </div>
        <div className="carousel-item">
          <img
            src={Curseol2}
            className="d-block w-100"
            alt="Eco Product 2"
            style={{ height: "650px", objectFit: "cover" }}
          />
        </div>
        <div className="carousel-item">
          <img
            src={Curseol3}
            className="d-block w-100"
            alt="Eco Product 3"
            style={{ height: "650px", objectFit: "cover" }}
          />
        </div>
        <div className="carousel-item">
          <img
            src={Curseol4}
            className="d-block w-100"
            alt="Eco Product 4"
            style={{ height: "650px", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Controls */}
      <button 
        className="carousel-control-prev" 
        type="button" 
        data-bs-target="#ecoCarousel" 
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button 
        className="carousel-control-next" 
        type="button" 
        data-bs-target="#ecoCarousel" 
        data-bs-slide="next"
      >
        <span className="carousel-control-next" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default Home;