
import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  return (
    <div className="absolute bottom-full mb-2">
      <Picker data={data} onEmojiSelect={onEmojiSelect} />
    </div>
  );
};
