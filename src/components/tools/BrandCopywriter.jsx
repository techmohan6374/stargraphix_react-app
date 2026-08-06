import { useState } from 'react';
import Icon from '../icons/Icons';
import toast from 'react-hot-toast';

export default function BrandCopywriter() {
  const [copyCategory, setCopyCategory] = useState('cafe');
  const [copyTone, setCopyTone] = useState('creative');
  const [copyKeyword, setCopyKeyword] = useState('');
  const [copyResult, setCopyResult] = useState(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  const handleGenerateCopy = (e) => {
    e.preventDefault();
    const keyword = copyKeyword.trim() || 'Design';
    setIsGeneratingCopy(true);

    setTimeout(() => {
      const templates = {
        cafe: {
          bold: {
            ad: `Fuel your hustle with ${keyword}! ☕\nNo excuses. Just bold beans and intense flavor. Experience Salem's strongest coffee today.`,
            flyer: `Salem's Strongest Roast: Try ${keyword} Today!`,
            social: `Bold flavors for bold minds. Get your daily dose of ${keyword} at Star Cafe. #SalemCafe #CoffeeLovers #SalemHustle`,
          },
          creative: {
            ad: `Meet your new creative corner at Star Cafe. Crafting beautiful cups of ${keyword} and serving inspiration daily. 🎨`,
            flyer: `Artisanal Coffee & Chill: Discover ${keyword}`,
            social: `A blank canvas and a cup of ${keyword}. Let your ideas flow today at Star Cafe. #SalemCoffee #CreativeMinds #CoffeeArt`,
          },
          professional: {
            ad: `The premium meeting venue in Salem. Serving premium ${keyword} and offering high-speed wifi for your business meetings.`,
            flyer: `Elevate Your Business Meetings with Premium Coffee`,
            social: `Networking is better over a cup of premium ${keyword}. Visit Star Cafe today. #BusinessNetworking #PremiumCoffee #SalemHub`,
          },
          elegant: {
            ad: `Sip luxury. Experience the refined notes of our handpicked ${keyword} blend in Salem. Exquisite ambiance, premium taste.`,
            flyer: `Sip Luxury: Handcrafted Single Origin Coffee`,
            social: `A quiet afternoon, a gourmet pastry, and a perfect cup of ${keyword}. True elegance in Salem. #GourmetCoffee #LuxuryLifestyle #StarCafe`,
          },
        },
        realestate: {
          bold: {
            ad: `Stop renting. Own your future now with ${keyword}! Salem's premium properties with guaranteed high returns. 🏡`,
            flyer: `Salem's Best Property Deals: Unlock ${keyword}`,
            social: `Stop dreaming, start owning. Invest in Salem's most premium listings like ${keyword} today. #PropertyInvestment #SalemHomes #HomeOwnership`,
          },
          creative: {
            ad: `Spaces that inspire you to live your best story. Discover the architectural wonders of ${keyword} homes in Salem.`,
            flyer: `Spaces Built for Your Life Story: Star Homes`,
            social: `Where design meets comfort. Welcome to the elegant layouts of ${keyword}. #DreamHome #HomeArchitecture #SalemRealEstate`,
          },
          professional: {
            ad: `Maximize your investment portfolio with Salem's premium commercial listings. High yields, trusted advisors, secure assets.`,
            flyer: `Premium Salem Real Estate: Strategic Investments`,
            social: `Secure your family's future with smart, strategic real estate investments in Salem. #CommercialRealEstate #SalemInvest #AssetBuilding`,
          },
          elegant: {
            ad: `Elegance has a new address. Exquisite luxury villas at ${keyword}. Premium finishes, gated community, Salem's finest living.`,
            flyer: `Salem's Finest Luxury Villas: Now Open`,
            social: `Wake up to lush green views and premium architectural finishes at ${keyword}. Live in luxury. #LuxuryVillas #SalemLuxury #HighEndLiving`,
          },
        },
        fashion: {
          bold: {
            ad: `Make heads turn. Bold, unapologetic fashion designed for the trendsetters in Salem. Wear ${keyword} and own the room! 🌟`,
            flyer: `Turn Heads: Salem's Bold New Apparel Collection`,
            social: `Life is too short to wear boring clothes. Make a statement with ${keyword} today. #Trendsetters #SalemFashion #WearBold`,
          },
          creative: {
            ad: `Wearable art for the creative soul. Express your unique vibe with Salem's most eccentric apparel lineup.`,
            flyer: `Express Your Inner Artistry with Creative Fashion`,
            social: `Your outfit is your canvas. Express yourself with the unique designs of ${keyword}. #WearableArt #CreativeApparel #SalemStyle`,
          },
          professional: {
            ad: `Dress for the career you want. Premium executive wear and tailored suits at ${keyword}. Professional style in Salem.`,
            flyer: `Dress for Success: Tailored Executive Apparels`,
            social: `Make a powerful first impression in the boardroom with premium business attire from ${keyword}. #SuccessStyle #CorporateWear #SalemBespoke`,
          },
          elegant: {
            ad: `Timeless designs. Pure premium fabrics. Experience the sophisticated charm of ${keyword} evening wear.`,
            flyer: `Timeless Sophistication: Salem Evening Apparels`,
            social: `Refined silhouettes and premium textiles. Discover elegance redrawn for Salem's trendsetters. #SophisticatedStyle #ElegantWear #StarFashion`,
          },
        },
        fitness: {
          bold: {
            ad: `No excuses. Just results. Unleash your inner beast with ${keyword} fitness coaching. Salem's ultimate gym experience. 💪`,
            flyer: `Unleash Your Inner Beast: Hardcore Gym Coaching`,
            social: `Sweat is just fat crying. Push your limits today with ${keyword}. #NoExcuses #SalemFitness #HardcoreGym`,
          },
          creative: {
            ad: `Fun, engaging workouts that keep you hooked. Mix up your routine with ${keyword} aerial yoga and fun dance fitness!`,
            flyer: `Mix Up Your Workouts: Dance Fitness & Yoga`,
            social: `Who said workouts have to be boring? Find your rhythm and get fit with ${keyword} today. #FunFitness #YogaSalem #EnjoyTheProcess`,
          },
          professional: {
            ad: `Science-backed body transformations. Certified personal trainers and customized nutrition coaching at ${keyword} Salem.`,
            flyer: `Science-Backed Training & Body Transformations`,
            social: `Achieve sustainable health goals with customized data-driven training programs from ${keyword}. #BodyTransformation #SalemTrainer #NutritionalCoaching`,
          },
          elegant: {
            ad: `Premium wellness clubs. Luxurious spa facilities, state-of-the-art machinery, and calm yoga studios at ${keyword}.`,
            flyer: `Premium Wellness & Luxury Spa: Elevate Your Health`,
            social: `Nourish your mind, body, and spirit in Salem's most premium wellness sanctuary. #PremiumWellness #YogaLife #SalemSpa`,
          },
        },
      };

      const catData = templates[copyCategory] || templates.cafe;
      const result = catData[copyTone] || catData.creative;
      setCopyResult(result);
      setIsGeneratingCopy(false);
      toast.success('AI Copy generated!');
    }, 1000);
  };

  const copyTextToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Saved to clipboard!');
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Icon name="FileText" size={24} className="text-primary-600" /> AI Brand Copywriter
        </h2>
        <p className="text-xs text-gray-400 mt-1">Simulate premium marketing slogans and ad copies client-side</p>
      </div>

      <p className="text-sm text-gray-500">
        Select your category and target tone of voice, input your business name/keyword, and generate high-impact copies.
      </p>

      <form onSubmit={handleGenerateCopy} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-150">
        <div>
          <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Business Category</label>
          <select value={copyCategory} onChange={(e) => setCopyCategory(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:border-primary-600 outline-none bg-white font-outfit">
            <option value="cafe">Cafe / Restaurant</option>
            <option value="realestate">Real Estate / Builders</option>
            <option value="fashion">Fashion / Clothing</option>
            <option value="fitness">Gym / Fitness Center</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Tone of Voice</label>
          <select value={copyTone} onChange={(e) => setCopyTone(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg p-2.5 focus:border-primary-600 outline-none bg-white font-outfit">
            <option value="bold">Bold & Aggressive</option>
            <option value="creative">Creative & Fresh</option>
            <option value="professional">Professional & Trustworthy</option>
            <option value="elegant">Elegant & Sophisticated</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Main Product / Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={copyKeyword}
              onChange={(e) => setCopyKeyword(e.target.value)}
              placeholder="e.g. Star Beans, Sky Heights"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary-600 bg-white"
            />
            <button type="submit" disabled={isGeneratingCopy} className="bg-primary-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow">
              {isGeneratingCopy ? '...' : 'Generate'}
            </button>
          </div>
        </div>
      </form>

      {copyResult ? (
        <div className="space-y-4 animate-fade-in">
          {/* Block 1 */}
          <div className="border border-gray-155 rounded-xl p-4 bg-white shadow-sm flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-wider block mb-1.5 w-max">Ad Headline & Body</span>
              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">{copyResult.ad}</p>
            </div>
            <button onClick={() => copyTextToClipboard(copyResult.ad)} className="text-gray-400 hover:text-primary-600 p-1 flex-shrink-0" title="Copy text"><Icon name="Check" size={16} /></button>
          </div>

          {/* Block 2 */}
          <div className="border border-gray-155 rounded-xl p-4 bg-white shadow-sm flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider block mb-1.5 w-max">Flyer Catchphrase</span>
              <p className="text-xs font-bold text-gray-800">{copyResult.flyer}</p>
            </div>
            <button onClick={() => copyTextToClipboard(copyResult.flyer)} className="text-gray-400 hover:text-primary-600 p-1 flex-shrink-0" title="Copy text"><Icon name="Check" size={16} /></button>
          </div>

          {/* Block 3 */}
          <div className="border border-gray-155 rounded-xl p-4 bg-white shadow-sm flex justify-between items-start">
            <div>
              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wider block mb-1.5 w-max">Social Media Caption</span>
              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">{copyResult.social}</p>
            </div>
            <button onClick={() => copyTextToClipboard(copyResult.social)} className="text-gray-400 hover:text-primary-600 p-1 flex-shrink-0" title="Copy text"><Icon name="Check" size={16} /></button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 italic text-sm">
          Enter details above to generate premium customized copywriting blocks.
        </div>
      )}
    </div>
  );
}
