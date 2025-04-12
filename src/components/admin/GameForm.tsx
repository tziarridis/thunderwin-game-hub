
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";

interface GameFormProps {
  onSubmit: (gameData: Game | Omit<Game, 'id'>) => void;
  initialValues?: Game;
}

const GameForm: React.FC<GameFormProps> = ({ onSubmit, initialValues }) => {
  const [formData, setFormData] = useState({
    title: initialValues?.title || "",
    image: initialValues?.image || "",
    provider: initialValues?.provider || "",
    category: initialValues?.category || "slots",
    tags: initialValues?.tags || [],
    rtp: initialValues?.rtp?.toString() || "96",
    minBet: initialValues?.minBet?.toString() || "0.10",
    maxBet: initialValues?.maxBet?.toString() || "100",
    volatility: initialValues?.volatility || "medium",
    jackpot: initialValues?.jackpot || false,
    isNew: initialValues?.isNew || false,
    isPopular: initialValues?.isPopular || false,
    releaseDate: initialValues?.releaseDate || new Date().toISOString().split('T')[0],
    description: initialValues?.description || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // When formatting game data for submission, ensure all required properties are included
    const gameData = {
      ...(initialValues?.id ? { id: initialValues.id } : {}),
      title: formData.title,
      image: formData.image,
      provider: formData.provider,
      category: formData.category as Game['category'],
      tags: initialValues?.tags || [],
      isPopular: formData.isPopular,
      isNew: formData.isNew,
      rtp: parseFloat(formData.rtp),
      minBet: parseFloat(formData.minBet),
      maxBet: parseFloat(formData.maxBet),
      volatility: formData.volatility as Game['volatility'],
      jackpot: initialValues?.jackpot || false,
      releaseDate: formData.releaseDate,
      description: formData.description
    };
    
    onSubmit(gameData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="thunder-input w-full"
            required
          />
        </div>
        
        <div>
          <label htmlFor="provider" className="block text-sm font-medium mb-1">
            Provider
          </label>
          <input
            type="text"
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="thunder-input w-full"
            required
          />
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Image URL
          </label>
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="thunder-input w-full"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="thunder-input w-full"
            required
          >
            <option value="slots">Slots</option>
            <option value="table">Table Games</option>
            <option value="live">Live Casino</option>
            <option value="jackpot">Jackpot</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="volatility" className="block text-sm font-medium mb-1">
            Volatility
          </label>
          <select
            id="volatility"
            name="volatility"
            value={formData.volatility}
            onChange={handleChange}
            className="thunder-input w-full"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="rtp" className="block text-sm font-medium mb-1">
            RTP (%)
          </label>
          <input
            type="number"
            id="rtp"
            name="rtp"
            value={formData.rtp}
            onChange={handleChange}
            className="thunder-input w-full"
            min="1"
            max="100"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label htmlFor="minBet" className="block text-sm font-medium mb-1">
            Min Bet
          </label>
          <input
            type="number"
            id="minBet"
            name="minBet"
            value={formData.minBet}
            onChange={handleChange}
            className="thunder-input w-full"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label htmlFor="maxBet" className="block text-sm font-medium mb-1">
            Max Bet
          </label>
          <input
            type="number"
            id="maxBet"
            name="maxBet"
            value={formData.maxBet}
            onChange={handleChange}
            className="thunder-input w-full"
            min="1"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label htmlFor="releaseDate" className="block text-sm font-medium mb-1">
            Release Date
          </label>
          <input
            type="date"
            id="releaseDate"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
            className="thunder-input w-full"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isNew"
              name="isNew"
              checked={formData.isNew}
              onChange={handleChange}
              className="thunder-checkbox"
            />
            <label htmlFor="isNew" className="ml-2 text-sm font-medium">
              New Game
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPopular"
              name="isPopular"
              checked={formData.isPopular}
              onChange={handleChange}
              className="thunder-checkbox"
            />
            <label htmlFor="isPopular" className="ml-2 text-sm font-medium">
              Popular Game
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="thunder-input w-full"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-white">
          {initialValues ? "Update Game" : "Add Game"}
        </Button>
      </div>
    </form>
  );
};

export default GameForm;
