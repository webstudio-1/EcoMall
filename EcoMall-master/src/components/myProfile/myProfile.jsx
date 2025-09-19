import React from "react";

/**
 * Account Option Card Component
 * Professional, reusable card component for account management options
 */
const AccountOptionCard = ({ icon, title, description, onClick }) => {
  const handleKeyPress = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className="account-card"
      onClick={onClick}
      onKeyDown={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={title}
    >
      <div className="account-card__content">
        <div className="account-card__icon">
          {icon}
        </div>
        <div className="account-card__text">
          <h3 className="account-card__title">{title}</h3>
          <p className="account-card__description">{description}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Account Options Configuration
 * Centralized data structure for maintainability
 */
const ACCOUNT_OPTIONS = [
  {
    id: "orders",
    title: "Your Orders",
    description: "Track, return, or buy things again",
    icon: "📦",
  },
  {
    id: "security",
    title: "Login & security",
    description: "Edit login, name, and mobile number",
    icon: "🔒",
  },
  // {
    // id: "prime",
    // title: "Prime",
    // description: "View benefits and payment settings",
    // icon: "📦",
  // },
  {
    id: "addresses",
    title: "Your Addresses",
    description: "Edit addresses for orders and gifts",
    icon: "📍",
  },
  {
    id: "business",
    title: "Your business account",
    description: "Sign up for free to save up to 18% with GST invoice and bulk discounts and purchase on credit.",
    icon: "💼",
  },
  {
    id: "payment",
    title: "Payment options",
    description: "Edit or add payment methods",
    icon: "💳",
  },
  {
    id: "balance",
    title: "EcoMall Pay balance",
    description: "Add money to your balance",
    icon: "💰",
  },
  {
    id: "contact",
    title: "Contact Us",
    description: "Contact our customer service via phone or chat",
    icon: "📞",
  },
];

/**
 * User Profile Information Component
 */
const UserProfileHeader = () => (
  <header className="profile-header">
    <div className="profile-header__content">
      <div className="profile-header__image-container">
        <img
          src="data:image/png;base64,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"
          alt="User profile"
          className="profile-header__image"
          loading="lazy"
        />
        <div className="profile-header__verified-badge" aria-label="Verified account">
          <span>✓</span>
        </div>
      </div>
      <div className="profile-header__info">
        <h1 className="profile-header__title">Your Account</h1>
        <div className="profile-header__details">
          <span className="profile-header__detail">
            <span className="profile-header__indicator profile-header__indicator--blue"></span>
            your.email@example.com
          </span>
          <span className="profile-header__detail">
            <span className="profile-header__indicator profile-header__indicator--green"></span>
            Hyderabad, India
          </span>
        </div>
      </div>
    </div>
  </header>
);

/**
 * Main Profile Page Component
 * Clean, professional implementation with proper separation of concerns
 */
const ProfilePage = () => {
  const handleOptionClick = (optionId) => {
    console.log(`Navigating to: ${optionId}`);
    // TODO: Implement actual navigation logic
  };

  return (
    <div className="profile-page">
      <div className="profile-page__container">
        <UserProfileHeader />
        
        <main className="profile-page__main">
          <section aria-labelledby="account-options-heading" className="account-section">
            <header className="account-section__header">
              <h2 id="account-options-heading" className="account-section__title">
                Your Account
              </h2>
            </header>
            
            <div className="account-grid">
              {ACCOUNT_OPTIONS.map((option) => (
                <AccountOptionCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  icon={<span className="account-icon">{option.icon}</span>}
                  onClick={() => handleOptionClick(option.id)}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
      
      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 1rem;
        }
        
        .profile-page__container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .profile-header {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }
        
        .profile-header__content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .profile-header__image-container {
          position: relative;
        }
        
        .profile-header__image {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          object-fit: cover;
        }
        
        .profile-header__verified-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 24px;
          height: 24px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .profile-header__title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }
        
        .profile-header__details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .profile-header__detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .profile-header__indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .profile-header__indicator--blue {
          background: #3b82f6;
        }
        
        .profile-header__indicator--green {
          background: #10b981;
        }
        
        .account-section__title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 2rem 0;
        }
        
        .account-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .account-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .profile-page {
            padding: 2rem;
          }
        }
        
        .account-card {
          background: white;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease-in-out;
          cursor: pointer;
          min-height: 140px;
        }
        
        .account-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          border-color: #d1d5db;
        }
        
        .account-card:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        .account-card__content {
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          height: 100%;
        }
        
        .account-card__icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: #f3f4f6;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .account-icon {
          font-size: 1.5rem;
        }
        
        .account-card__text {
          flex: 1;
          min-width: 0;
        }
        
        .account-card__title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }
        
        .account-card__description {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;

