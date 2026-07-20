/** @jsxImportSource solid-js */

const FarLeftSemicircle = () => {
    return (
        <>
            <div class="left-side-semicircle relative z-10 w-[110px] h-[45px]">
                <div 
                    style={
                        "border-radius: 50% / 0 0 100% 100%;"
                    }
                    class="absolute top-16 -left-10 w-full h-full -rotate-35 bg-gradient-to-tr from-[var(--gradient-first)] to-[var(--gradient-second)]"
                >
                </div>
            </div>
        </>
    )
}

export default FarLeftSemicircle;