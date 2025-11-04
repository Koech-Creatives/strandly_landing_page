import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import FeaturesSection from "@/components/FeaturesSection";
import ForClientsStylistsSection from "@/components/ForClientsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import NewHeroImage from "@/assets/image.png";
import { GetStartedButton } from "@/components/GetStartedButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="flex flex-col overflow-hidden">
            <ContainerScroll
                titleComponent={
                <>
                    <div className="flex flex-col items-center ">
                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-display text-[#1a0f0a]">
                            Your Hair's Future
                        </h1>
                        <p className="text-base md:text-2xl font-body text-[#1a0f0a] mt-2">
                            Discover personalized hair care like never before.
                        </p>
                        <GetStartedButton />
                    </div>
                </>
                }
            >
                <img
                    src={NewHeroImage}
                    alt="hero"
                    height={700}
                    width={1400}
                    className="mx-auto rounded-2xl object-cover h-full object-left-top"
                />
            </ContainerScroll>
        </div>
        <FeaturesSection id="features" />
        <ForClientsStylistsSection id="for-clients-stylists" />
        <TestimonialsSection id="testimonials" />
      </main>
      <Footer id="contact" />
    </div>
  );
};

export default Index;

