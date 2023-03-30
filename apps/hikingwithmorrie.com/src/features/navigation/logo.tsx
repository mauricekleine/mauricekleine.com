type Props = {
  className?: string;
};

export function Logo({ className }: Props) {
  return (
    <svg
      className={className}
      width="228"
      height="328"
      viewBox="0 0 228 328"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M113 1.41502C111.625 2.14902 107.8 3.07501 104.5 3.47401C97.382 4.33401 84.985 8.10402 76.154 12.094C64.164 17.512 50.554 28.575 40.817 40.817C34.632 48.594 32.553 52.583 26.394 68.5C22.86 77.631 22.518 79.369 22.452 88.5C22.382 98.282 22.255 98.814 16.6 112.892C13.421 120.808 8.35702 132.667 5.34702 139.246C2.33702 145.825 0.0340236 151.367 0.230024 151.563C0.426024 151.759 1.88802 150.801 3.47802 149.434L6.37102 146.949L8.18902 151.724C9.85102 156.092 9.87702 156.824 8.49302 160.296C6.92202 164.237 7.38102 166.341 10.629 170.08C11.479 171.058 12.245 175.439 12.639 181.58C13.773 199.233 13.687 200.58 11.215 203.924L8.94002 207H12.402C16.782 207 19.133 210.154 20.975 218.5C21.703 221.8 23.544 226.525 25.065 229C26.587 231.475 28.342 235.525 28.966 238C29.591 240.475 30.778 244.257 31.605 246.405C32.432 248.553 34.651 256.203 36.538 263.405C38.424 270.607 40.27 277.625 40.639 279C41.008 280.375 42.781 283.15 44.578 285.168C49.234 290.393 51.168 293.583 51.918 297.275C52.462 299.953 53.194 300.655 56.233 301.413C58.981 302.099 60.198 303.095 61.121 305.413C64.114 312.935 69.377 317 76.122 317C77.705 317 79 317.45 79 318C79 318.55 79.892 319.892 80.982 320.982C82.584 322.584 83.459 322.776 85.548 321.982C88.387 320.902 90.226 321.588 95.787 325.803C98.944 328.196 99.439 328.264 108.287 327.536C113.354 327.119 121.461 326.615 126.302 326.416C143.689 325.701 157 320.078 166.54 309.418C170.093 305.449 173 301.843 173 301.405C173 300.968 174.071 299.46 175.381 298.055C176.69 296.65 179.219 292.748 181 289.385C182.781 286.022 185.84 281.522 187.798 279.385C193.819 272.814 202.024 250.025 204.258 233.668C205.376 225.482 205.776 224.471 209.734 219.834C213.974 214.867 214.297 214.127 215.522 206.568C216.482 200.643 222.819 179.371 225.573 172.827C228.337 166.261 228.606 161.968 226.608 156.307C224.559 150.499 222.989 135.959 223.121 124C223.372 101.048 215.718 75.542 200.614 49C190.61 31.421 181.641 22.479 166.443 14.934C157.97 10.727 155.429 9.00002 155.185 7.28302C154.839 4.85302 150.35 3.42101 144.187 3.77401C142.365 3.87801 139.775 3.24401 138.433 2.36401C135.661 0.548013 129.831 0.354015 125.663 1.93801C123.461 2.77501 122.382 2.68102 120.702 1.50402C118.098 -0.319983 116.289 -0.340984 113 1.41502ZM119.581 5.64502C121.679 7.02002 122.717 7.10202 125.911 6.14502C131.173 4.56802 135.143 4.71202 137.803 6.57402C139.039 7.44002 141.502 8.07001 143.275 7.97301C149.39 7.64001 150.68 8.00301 151.752 10.355C152.342 11.651 155.34 14.129 158.413 15.864C161.486 17.598 166.709 21.077 170.019 23.594C177.626 29.38 182.212 37.325 176.037 34.02C170.658 31.141 143.182 21.867 135.646 20.386C124.311 18.159 98.109 19.662 87.778 23.132C84.081 24.374 80.785 25.119 80.454 24.788C79.496 23.829 82.715 18.368 86.106 15.199C87.815 13.602 92.12 11.268 95.673 10.014C101.312 8.02302 102.451 7.90301 104.632 9.07101C106.61 10.129 107.481 10.154 108.815 9.18901C111.537 7.22101 116.476 4.00802 116.785 4.00402C116.942 4.00202 118.2 4.74002 119.581 5.64502ZM132.5 42.515C161.47 46.822 174.019 52.253 189.633 67.243C198.492 75.748 208.549 89.782 214.277 101.631C218.973 111.348 219.247 112.763 219.094 126.5C218.994 135.518 219.588 141.894 221.487 152.158L224.013 165.815L220.992 173.36C217.534 181.997 211 205.149 211 208.766C211 211.828 208.001 217 206.225 217C205.487 217 205.077 216.663 205.314 216.25C205.552 215.838 205.435 213.475 205.055 211L204.362 206.5L203.168 211C199.391 225.238 197.559 231.372 194.806 239C193.119 243.675 191.61 247.65 191.453 247.833C191.295 248.017 190.229 247.229 189.083 246.083C186.498 243.498 185.774 243.487 183.5 246C181.589 248.111 179 248.687 179 247C179 245.109 177.32 246.003 176.182 248.5C174.539 252.105 173.507 251.615 171.462 246.262C167.408 235.647 159.794 225.408 155.262 224.477C147.889 222.962 145.094 221.793 143.679 219.633C138.431 211.623 132.065 212.172 127.485 221.029C125.578 224.717 123.333 224.791 119.56 221.292C116.147 218.128 112.382 217.875 104 220.247C80.706 226.838 79.718 227.278 75.977 232.738C72.446 237.892 72.713 242.734 76.768 247.061C80.004 250.514 80.723 252 79.159 252C76.675 252 68.738 248.939 66.349 247.06C64.174 245.349 62.807 245.026 59.854 245.525C56.75 246.049 55.894 245.804 54.817 244.078C53.503 241.975 49.587 241.241 48.558 242.906C47.605 244.449 43.961 242.866 41.831 239.985C40.467 238.141 39.177 237.402 37.9 237.736C36.437 238.119 35.988 237.689 35.949 235.867C35.663 222.479 35.118 215.087 34.264 213C33.274 210.583 33.201 210.646 32.041 214.902C31.381 217.323 30.043 220.793 29.068 222.613L27.294 225.921L26.24 222.211C25.66 220.17 24.449 215.925 23.55 212.777C22.569 209.343 21.032 206.435 19.707 205.506C17.802 204.171 17.482 202.969 17.369 196.73C17.04 178.502 16.141 170.681 14.048 167.851C11.696 164.669 11.533 163.119 13.174 159.518C14.12 157.442 14.011 155.877 12.614 151.446C10.662 145.253 11 143.36 15.137 137.32C18.608 132.251 18.908 129.799 15.686 132.826C11.581 136.681 11.54 135.176 15.512 126.515C18.286 120.466 23.806 106.336 25.895 99.938C28.446 92.126 36.5 81.569 49.126 69.487C66.474 52.887 85.426 42.733 103 40.622C108.498 39.962 120.508 40.733 132.5 42.515ZM201.528 103.5C201.951 108.45 202.417 119.25 202.564 127.5C202.71 135.75 203.472 145.532 204.256 149.238C205.04 152.944 205.783 161.944 205.907 169.238C206.031 176.532 206.484 182.859 206.914 183.298C208.236 184.647 211.331 172.893 211.418 166.196C211.494 160.335 211.589 160.076 212.705 162.684C213.368 164.233 214.209 166.982 214.574 168.794C215.417 172.969 217.204 172.434 218.331 167.669C219.087 164.47 218.71 162.983 215.431 156.246C212.677 150.586 211.563 146.884 211.296 142.5L210.929 136.5L212.513 139.98C213.707 142.603 214.31 143.117 214.959 142.066C215.916 140.518 215.855 140.07 213.533 131.5C212.562 127.916 211.89 121.473 211.865 115.5L211.822 105.5L209.798 109.424C207.395 114.082 207.023 113.667 204.08 103.046C202.963 99.014 201.758 95.442 201.404 95.108C201.049 94.773 201.105 98.55 201.528 103.5ZM80 114.533C76.425 115.328 71.925 116.276 70 116.639C62.14 118.12 48 126.353 48 129.447C48 132.203 49.842 131.971 54.881 128.58C58.83 125.923 61.424 125.007 66.558 124.457C76.058 123.44 77.07 123.522 83.868 125.875C87.416 127.103 92.486 128 95.878 128C99.107 128 103.493 128.591 105.624 129.313C113.298 131.914 115.178 129.098 109.98 122.791C106.218 118.227 97.939 114.087 91.439 113.519C88.723 113.281 83.575 113.737 80 114.533ZM30.621 118.75C28.105 122.668 25.611 129.847 24.533 136.278C24.184 138.356 23.536 139.831 23.093 139.558C22.044 138.909 17.625 155.527 17.725 159.743C17.767 161.527 18.994 165.02 20.45 167.506C23.983 173.533 27.641 183.422 28.529 189.343C29.045 192.788 29.556 193.844 30.331 193.069C31.105 192.295 31.07 190.711 30.206 187.48C28.581 181.406 28.71 174.817 30.606 167C31.581 162.98 32.308 154.586 32.512 145C32.693 136.475 33.324 126.575 33.913 123C35.228 115.024 35.229 115 34.014 115C33.472 115 31.945 116.688 30.621 118.75ZM157.098 121.265C153.464 123.133 148.628 129.587 149.384 131.558C149.935 132.994 150.978 133.13 156.763 132.523C160.468 132.133 165.957 131.182 168.96 130.408C178.771 127.878 184.211 129.099 191.412 135.444C195.124 138.716 195.701 138.093 193.36 133.34C191.238 129.033 183.487 123.868 175.568 121.485C169.596 119.686 160.38 119.577 157.098 121.265ZM99.203 136.117C99.733 137.72 103.327 139.675 107.183 140.459C110.636 141.161 111.176 142.994 111.906 156.489C112.414 165.88 112.754 167.527 114.25 167.813C116.201 168.185 116.459 166.445 116.157 154.942C115.929 146.285 114.056 140.116 110.984 137.902C107.691 135.529 98.55 134.144 99.203 136.117ZM75 144.081C65.159 145.226 58.454 149.32 60.664 152.834C62.153 155.202 67.629 158.218 69.713 157.817C71.012 157.567 70.433 156.863 67.504 155.135L63.534 152.792L67.017 150.938C71.694 148.448 72 148.517 72 152.066C72 157.886 73.361 159 80.476 159C83.999 159 87.171 158.532 87.524 157.961C87.878 157.389 88.167 154.911 88.167 152.453V147.985L91.15 149.743C92.791 150.709 94.849 152.287 95.722 153.25C97.198 154.877 97.119 155 94.596 155C93.041 155 92.146 155.427 92.5 156C93.261 157.232 104 157.342 104 156.119C104 154.406 97.445 148.724 93.315 146.856C87.532 144.241 81.488 143.326 75 144.081ZM160.606 148.525C157.166 149.707 153.389 152.232 148.09 156.893C146.764 158.059 145.864 159.17 146.09 159.361C146.735 159.91 156.25 163 157.293 163C157.808 163 157.503 161.891 156.615 160.535C154.597 157.455 154.556 155.384 156.5 154.638C157.614 154.211 158 154.786 158 156.876C158 161.866 163 164.616 169.09 162.976C173.249 161.856 175 159.661 175 155.566C175 154.155 175.256 153 175.57 153C175.883 153 178.149 154.382 180.604 156.072C186.714 160.275 188.261 159.261 183.303 154.303C177.309 148.309 168.073 145.957 160.606 148.525ZM105.044 190.108C103.255 191.818 100.897 195.239 99.804 197.711C97.164 203.678 97.985 207.901 102.566 211.924C106.413 215.302 106.807 215.428 109 213.977C110.271 213.137 110.118 212.685 108 211.015C106.625 209.931 105.207 209.034 104.848 209.022C104.489 209.01 103.712 207.612 103.12 205.915C101.707 201.861 103.709 196.952 108.604 192.469C112.024 189.336 112.445 187 109.589 187C108.878 187 106.833 188.399 105.044 190.108ZM145.468 193.051C145.111 193.629 145.984 195.183 147.409 196.504C150.642 199.5 150.687 202.03 147.572 205.732C146.009 207.589 145.439 209.093 145.972 209.954C147.167 211.889 149.687 210.561 151.991 206.784C154.37 202.88 154.506 200.146 152.551 195.468C151.447 192.826 150.508 192 148.61 192C147.239 192 145.826 192.473 145.468 193.051ZM110.2 203.2C107.324 206.076 110.341 209.428 116.75 210.479C122.174 211.368 122.191 210.175 116.82 205.578C112.166 201.594 111.901 201.499 110.2 203.2ZM139.413 203.948C135.105 204.97 134 205.816 134 208.09C134 210.951 136.753 211.566 139.301 209.276C140.51 208.188 142.325 207.006 143.333 206.648C145.156 206.002 145.227 203.811 143.438 203.42C142.922 203.308 141.111 203.545 139.413 203.948ZM121.184 232.137C123.515 233.331 126.761 233.216 130.676 231.8C133.275 230.861 135.672 230.875 141.747 231.867C155.357 234.09 156.404 234.43 161.75 238.344C166.951 242.152 167.826 243.371 166.116 244.428C165.63 244.729 164.291 246.978 163.14 249.426C161.989 251.875 160.079 254.78 158.896 255.882C157.327 257.344 156.89 258.642 157.28 260.682C157.993 264.416 156.465 267 153.544 267C151.711 267 151.008 267.689 150.505 269.976C150.146 271.612 150.137 273.412 150.485 273.976C150.836 274.544 150.228 275 149.118 275C146.462 275 145.756 276.359 145.823 281.343L145.878 285.5L144.208 282.75C143.289 281.238 142.246 280 141.891 280C140.32 280 138.885 283.178 138.326 287.894C137.994 290.702 137.433 293 137.08 293C136.727 293 135.777 291.12 134.969 288.823C134.161 286.526 133.025 284.492 132.444 284.304C131.863 284.116 130.582 285.653 129.597 287.72L127.805 291.477L125.945 289.181C124.312 287.164 123.806 287.037 121.793 288.141C120.532 288.833 118.561 289.286 117.414 289.149C115.014 288.862 113.666 290.268 112.31 294.474C111.389 297.33 111.223 297.092 108.114 288.474C103.906 276.808 103.448 276.134 92.388 265.321C87.225 260.273 82.986 255.323 82.968 254.321C82.951 253.32 82.276 251.626 81.468 250.559C79.334 247.737 79.669 243.48 82.25 240.612C83.488 239.238 88.769 236.31 93.986 234.106C103.124 230.246 103.766 230.121 111.486 230.687C115.894 231.01 120.258 231.663 121.184 232.137ZM129.5 239.659C126.476 240.513 122.524 240.844 119.5 240.497C108.431 239.229 101.186 239.722 97.509 241.995C94.014 244.154 92.785 247 95.346 247C96.087 247 98.167 246.264 99.969 245.366C102.694 244.006 105.202 243.84 114.873 244.377C123.736 244.87 127.807 244.667 132 243.524C139.288 241.536 141.824 241.616 146.46 243.98C149.338 245.447 150.685 245.677 151.661 244.867C153.476 243.36 152.458 242.112 147.627 239.918C142.845 237.747 136.594 237.657 129.5 239.659ZM135.5 252.742C127.487 256.102 118.57 256.49 110.125 253.846C103.905 251.899 100.843 252.319 102.438 254.9C103.857 257.195 116.905 260.239 123.522 259.818C129.644 259.428 129.865 259.492 128.315 261.205C127.077 262.572 125.179 263 120.345 263C116.177 263 114 262.6 114 261.833C114 261.192 113.735 260.932 113.411 261.256C113.087 261.579 112.699 264.129 112.549 266.922C112.287 271.785 112.662 272.438 115.539 272.123C116.111 272.06 116.561 273.245 116.539 274.755C116.498 277.623 118.328 278.191 122.25 276.528C123.598 275.957 124 276.27 124 277.893C124 279.052 124.424 280 124.943 280C126.446 280 129 275.768 129 273.277C129 271.395 129.54 271 132.117 271C134.927 271 135.185 270.747 134.74 268.421C134.427 266.783 134.749 265.65 135.624 265.314C137.637 264.542 137.303 262.233 135 261C132.084 259.439 132.527 258.464 136.75 257.145C141.77 255.577 144.388 253.455 143.657 251.548C142.926 249.643 142.875 249.65 135.5 252.742Z"
        fill="black"
      />
    </svg>
  );
}
