import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center bg-warm-beige text-center relative overflow-hidden p-4">
      {/* Decorative shapes */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-soft-caramel/20 rounded-full filter blur-3xl opacity-50 animate-blob" style={{animationDelay: '0s'}}></div>
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-caramel-gold/20 rounded-full filter blur-3xl opacity-50 animate-blob" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-1/3 h-1/3 bg-cocoa-brown/5 rounded-full filter blur-2xl opacity-50 animate-blob" style={{animationDelay: '4s'}}></div>

      <div className="relative z-10 space-y-6">
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-cocoa-brown leading-tight drop-shadow-sm">
          {t("hero.title")}
        </h1>
        <p className="font-body text-lg md:text-2xl text-cocoa-brown/80 leading-relaxed max-w-2xl mx-auto">
          {t("hero.tagline")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button variant="hero" size="xl" className="font-body" onClick={() => navigate('/about-us')}>
            Discover Strandly
          </Button>
          <Button variant="hero-outline" size="xl" className="font-body" onClick={() => navigate('/learn-more')}>
            {t("hero.learn_more")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


