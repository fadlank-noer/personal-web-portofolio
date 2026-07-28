import { useState, useEffect } from 'preact/hooks';

interface OpponentChatProps {
    answer: string;
    images: string[];
    answer_type: string;
}

const OpponentChat = ({ answer, images, answer_type }: OpponentChatProps) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        const chars = answer.split('');
        let i = 0;
        const delay = Math.max(15, Math.min(50, 2000 / chars.length));

        const stream = () => {
            if (i < chars.length) {
                setDisplayedText(prev => prev + chars[i]);
                i++;
                setTimeout(stream, delay);
            }
        };

        const timer = setTimeout(stream, 300);
        return () => clearTimeout(timer);
    }, [answer]);

    return (
        <div className="flex flex-col gap-2 max-w-[80%]">
            {/* Streaming text */}
            <div className="bg-[#2f2f2f] px-4 py-3 rounded-2xl rounded-bl-md">
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                    {displayedText}
                </p>
            </div>

            {/* Images */}
            {answer_type === 'image' && images.length > 0 && (
                <div className="no-scrollbar flex flex-nowrap gap-0.5 overflow-auto sm:gap-1 sm:overflow-hidden mt-1 mb-2">
                    {images.map((img, imgIdx) => (
                        <div
                            className={`relative w-32 shrink-0 overflow-hidden rounded-xl border-[0.5px] max-h-40 sm:w-[calc((100%-0.5rem)/3)] ${
                                imgIdx === 0 ? 'rounded-s-xl' : (imgIdx === images.length - 1 ? 'rounded-e-xl' : '')
                            }`}
                            style={{ aspectRatio: 5 / 4 }}
                        >
                            <div className="relative rounded-[inherit] h-full w-full" style={{ aspectRatio: 5 / 4 }}>
                                <div className="h-full w-full overflow-hidden rounded-[inherit]">
                                    <img
                                        alt={img}
                                        referrerPolicy="no-referrer"
                                        className="m-0 h-full w-full object-cover"
                                        src={img}
                                        style={{ objectPosition: '50% 0%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OpponentChat;