import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ForClientsStylistsSection = ({ id }: { id?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section id={id} className="py-24 bg-warm-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 text-center">
        <h2 className="font-display text-4xl sm:text-5xl text-cocoa-brown mb-6">
          A Tailored Experience for Everyone
        </h2>
        <p className="font-body text-xl text-cocoa-brown/80 leading-relaxed mb-12">
          Whether you're looking for the perfect hair care routine or aiming to grow your salon business, Strandly is built for you.
        </p>
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-transparent border-2 border-[#6B3F1D] rounded-lg">
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-[#6B3F1D] data-[state=active]:text-white rounded-md"
            >
              For Clients
            </TabsTrigger>
            <TabsTrigger
              value="stylists"
              className="data-[state=active]:bg-[#6B3F1D] data-[state=active]:text-white rounded-md"
            >
              For Stylists
            </TabsTrigger>
          </TabsList>
          <TabsContent value="clients">
            <div className="mt-12 text-center">
              <h3 className="font-display text-3xl text-foreground mb-4">{t("for_clients.title")}</h3>
              <p className="font-body text-foreground/80 mb-6 max-w-2xl mx-auto">{t("for_clients.subtitle")}</p>
              <ul className="font-body text-foreground/80 mb-6 list-none inline-block text-left space-y-2">
                  <li>✓ Personalized product recommendations.</li>
                  <li>✓ Connect with expert stylists.</li>
                  <li>✓ Track your hair's progress.</li>
              </ul>
              <div className="mt-6">
                <Button variant="link" className="p-0 h-auto text-base text-cocoa-brown" onClick={() => navigate('/learn-more')}>
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="stylists">
            <div className="mt-12 text-center">
              <h3 className="font-display text-3xl text-foreground mb-4">{t("for_stylists.title")}</h3>
              <p className="font-body text-foreground/80 mb-6 max-w-2xl mx-auto">{t("for_stylists.subtitle")}</p>
              <ul className="font-body text-foreground/80 mb-6 list-none inline-block text-left space-y-2">
                  <li>✓ Manage your client base effortlessly.</li>
                  <li>✓ Streamline your booking process.</li>
                  <li>✓ Showcase your work and attract new clients.</li>
              </ul>
              <div className="mt-6">
                <Button variant="link" className="p-0 h-auto text-base text-cocoa-brown" onClick={() => navigate('/about-us')}>
                  Become a Strandly Stylist <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ForClientsStylistsSection;