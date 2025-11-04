import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import heroPortrait from "@/assets/learn-more.png";

const LearnMore = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="min-h-screen bg-warm-white">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="mb-6 md:mb-8">
            <BackButton />
          </div>
          
          {/* Mobile Layout - Stacked */}
          <div className="lg:hidden">
            {/* Image Section */}
            <div className="mb-8">
              <img
                src={heroPortrait}
                alt="Woman with natural afro hair"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            {/* Content Section */}
            <div className="space-y-6">
              {/* Main Heading */}
              <h1 className="text-3xl md:text-4xl font-bold text-cocoa-brown leading-tight">
                {t("learn_more.title")}
              </h1>
              
              {/* Intro Paragraph */}
              <p className="text-base md:text-lg text-cocoa-brown leading-relaxed">
                Finding the perfect Afro hairstylist used to mean scrolling for hours, saving screenshots, and hoping for a repin. <strong>Strandly changes that.</strong>
              </p>
              
              {/* Features Section */}
              <div className="space-y-4">
                <p className="text-base md:text-lg text-cocoa-brown">
                  {t("learn_more.features_intro")}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-cocoa-brown mr-3 mt-1">-</span>
                    <span className="text-base md:text-lg text-cocoa-brown">
                      {t("learn_more.feature1")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cocoa-brown mr-3 mt-1">-</span>
                    <span className="text-base md:text-lg text-cocoa-brown">
                      {t("learn_more.feature2")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cocoa-brown mr-3 mt-1">-</span>
                    <span className="text-base md:text-lg text-cocoa-brown">
                      {t("learn_more.feature3")}
                    </span>
                  </li>
                </ul>
              </div>
              
              {/* Stylist Section */}
              <p className="text-base md:text-lg text-cocoa-brown leading-relaxed">
                And if you're a stylist. <strong>Strandly was built for you too.</strong> Showcase your craft, grow your bookings, and let your talent shine while we handle the admin.
              </p>
              
              {/* Conclusion */}
              <p className="text-base md:text-lg text-cocoa-brown leading-relaxed">
                Your hair journey deserves to feel effortless—and with <strong>Strandly, it finally does.</strong>
              </p>
            </div>
          </div>
          
          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:flex items-start space-x-12">
            {/* Left Section - Image */}
            <div className="w-1/2">
              <img
                src={heroPortrait}
                alt="Woman with natural afro hair"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            {/* Right Section - Content */}
            <div className="w-1/2 space-y-6">
              {/* Main Heading */}
              <h1 className="text-4xl lg:text-5xl font-bold text-cocoa-brown leading-tight">
                {t("learn_more.title")}
              </h1>
              
              {/* Intro Paragraph */}
              <p className="text-lg text-cocoa-brown leading-relaxed">
                Finding the perfect Afro hairstylist used to mean scrolling for hours, saving screenshots, and hoping for a repin. <strong>Strandly changes that.</strong>
              </p>
              
              {/* Features Section */}
              <div className="space-y-4">
                <p className="text-lg text-cocoa-brown">
                  {t("learn_more.features_intro")}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-cocoa-brown mr-3 mt-1">-</span>
                    <span className="text-lg text-cocoa-brown">
                      {t("learn_more.feature1")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cocoa-brown mr-3 mt-1">-</span>
                    <span className="text-lg text-cocoa-brown">
                      {t("learn_more.feature2")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cocoa-brown mr-3 mt-1">-</span>
                    <span className="text-lg text-cocoa-brown">
                      {t("learn_more.feature3")}
                    </span>
                  </li>
                </ul>
              </div>
              
              {/* Stylist Section */}
              <p className="text-lg text-cocoa-brown leading-relaxed">
                And if you're a stylist. <strong>Strandly was built for you too.</strong> Showcase your craft, grow your bookings, and let your talent shine while we handle the admin.
              </p>
              
              {/* Conclusion */}
              <p className="text-lg text-cocoa-brown leading-relaxed">
                Your hair journey deserves to feel effortless—and with <strong>Strandly, it finally does.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnMore;
