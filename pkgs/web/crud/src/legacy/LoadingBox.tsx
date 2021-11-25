/** @jsx jsx **/
import { jsx, css } from '@emotion/react'

export const LoadingBox = () => {
  return (
    <div
      className={`w-full h-full`}
      css={css`
          .shine {
            opacity: 0.7; 
            background: rgba(205, 203, 203, 0.475);
            background-image: linear-gradient(
              to right,
              rgba(255, 255, 255, 0.2) 0%, 
              #c8cad1 20%,
              rgba(255, 255, 255, 0.2) 40%,
              #c8cad1 100%
            );
            background-repeat: no-repeat;
            background-size: 1000px 1000px;
            display: inline-block;
            position: relative;

            animation-duration: 1s;
            animation-fill-mode: forwards;
            animation-iteration-count: infinite;
            animation-name: placeholderShimmer;
            animation-timing-function: linear;
          }

          .box {
            height: 100%;
            width: 100%;
          }

          @keyframes placeholderShimmer {
            0% {
              background-position: -468px 0;
            }

            100% {
              background-position: 468px 0;
            }
          }
        `}
    >
      <div className="box shine"></div>
    </div>
  )
}

export default LoadingBox;