import { useTranslation } from "react-i18next";
import { Search, Calendar, Star } from "lucide-react";

const FeaturesSection = ({ id }: { id?: string }) => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Search className="h-10 w-10 text-white" />,
      title: "Find Your Perfect Stylist",
      description: "Easily search and filter through a curated list of professional Afro hairstylists in your area.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-white" />,
      title: "Seamless Booking",
      description: "Book your appointments in just a few taps, with real-time availability and instant confirmation.",
    },
    {
      icon: <Star className="h-10 w-10 text-white" />,
      title: "Verified Reviews",
      description: "Read authentic reviews from other clients to book with confidence.",
    },
  ];

  return (
    <section id={id} className="py-24 bg-cocoa-brown text-warm-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl text-warm-white">Why You'll Love Strandly</h2>
          <p className="font-body text-lg text-warm-white/80 mt-4">The future of Afro hair care is here.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto w-20 h-20 bg-warm-beige/10 rounded-full flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="font-display text-2xl text-warm-white mb-4">{feature.title}</h3>
              <p className="font-body text-warm-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
