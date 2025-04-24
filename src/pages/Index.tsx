
import BookingCalendar from "../components/BookingCalendar";
import Logo from "../components/Logo";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Qual o melhor dia para sua reunião com o nosso advogado</h1>
        </div>
        <BookingCalendar />
      </div>
    </div>
  );
};

export default Index;
