type Props = {
  className?: string;
};

export function QuestLogo({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 145 41"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M57.504 32.384C55.7547 32.384 54.1227 32.096 52.608 31.52C51.1147 30.944 49.8133 30.1333 48.704 29.088C47.616 28.0427 46.7627 26.816 46.144 25.408C45.5467 24 45.248 22.464 45.248 20.8C45.248 19.136 45.5467 17.6 46.144 16.192C46.7627 14.784 47.6267 13.5573 48.736 12.512C49.8453 11.4667 51.1467 10.656 52.64 10.08C54.1333 9.504 55.7547 9.216 57.504 9.216C59.2747 9.216 60.896 9.504 62.368 10.08C63.8613 10.656 65.152 11.4667 66.24 12.512C67.3493 13.536 68.2133 14.752 68.832 16.16C69.4507 17.568 69.76 19.1147 69.76 20.8C69.76 22.464 69.4507 24.0107 68.832 25.44C68.2133 26.848 67.3493 28.0747 66.24 29.12C65.152 30.144 63.8613 30.944 62.368 31.52C60.896 32.096 59.2747 32.384 57.504 32.384ZM64.832 37.152C63.9573 37.152 63.1253 37.056 62.336 36.864C61.568 36.672 60.8 36.3627 60.032 35.936C59.2853 35.5093 58.496 34.9333 57.664 34.208C56.8533 33.4827 55.968 32.5867 55.008 31.52L60.448 30.144C61.024 30.9333 61.5573 31.5627 62.048 32.032C62.5387 32.5013 63.008 32.832 63.456 33.024C63.9253 33.216 64.416 33.312 64.928 33.312C66.2933 33.312 67.5093 32.7573 68.576 31.648L70.88 34.4C69.3653 36.2347 67.3493 37.152 64.832 37.152ZM57.504 27.968C58.5067 27.968 59.424 27.7973 60.256 27.456C61.1093 27.1147 61.856 26.624 62.496 25.984C63.136 25.344 63.6267 24.5867 63.968 23.712C64.3307 22.816 64.512 21.8453 64.512 20.8C64.512 19.7333 64.3307 18.7627 63.968 17.888C63.6267 17.0133 63.136 16.256 62.496 15.616C61.856 14.976 61.1093 14.4853 60.256 14.144C59.424 13.8027 58.5067 13.632 57.504 13.632C56.5013 13.632 55.5733 13.8027 54.72 14.144C53.8667 14.4853 53.12 14.976 52.48 15.616C51.8613 16.256 51.3707 17.0133 51.008 17.888C50.6667 18.7627 50.496 19.7333 50.496 20.8C50.496 21.8453 50.6667 22.816 51.008 23.712C51.3707 24.5867 51.8613 25.344 52.48 25.984C53.12 26.624 53.8667 27.1147 54.72 27.456C55.5733 27.7973 56.5013 27.968 57.504 27.968ZM80.568 32.256C79.1387 32.256 77.8587 31.9787 76.728 31.424C75.6187 30.8693 74.7547 30.0267 74.136 28.896C73.5173 27.744 73.208 26.2827 73.208 24.512V14.784H78.2V23.776C78.2 25.2053 78.4987 26.2613 79.096 26.944C79.7147 27.6053 80.5787 27.936 81.688 27.936C82.456 27.936 83.1387 27.776 83.736 27.456C84.3333 27.1147 84.8027 26.6027 85.144 25.92C85.4853 25.216 85.656 24.3413 85.656 23.296V14.784H90.648V32H85.912V27.264L86.776 28.64C86.2 29.8347 85.3467 30.7413 84.216 31.36C83.1067 31.9573 81.8907 32.256 80.568 32.256ZM103.817 32.256C101.854 32.256 100.126 31.872 98.6328 31.104C97.1608 30.336 96.0194 29.2907 95.2088 27.968C94.3981 26.624 93.9928 25.0987 93.9928 23.392C93.9928 21.664 94.3874 20.1387 95.1768 18.816C95.9874 17.472 97.0861 16.4267 98.4728 15.68C99.8594 14.912 101.427 14.528 103.177 14.528C104.862 14.528 106.377 14.8907 107.721 15.616C109.086 16.32 110.163 17.344 110.953 18.688C111.742 20.0107 112.137 21.6 112.137 23.456C112.137 23.648 112.126 23.872 112.105 24.128C112.083 24.3627 112.062 24.5867 112.041 24.8H98.0568V21.888H109.417L107.497 22.752C107.497 21.856 107.315 21.0773 106.953 20.416C106.59 19.7547 106.089 19.2427 105.449 18.88C104.809 18.496 104.062 18.304 103.209 18.304C102.355 18.304 101.598 18.496 100.937 18.88C100.297 19.2427 99.7954 19.7653 99.4328 20.448C99.0701 21.1093 98.8888 21.8987 98.8888 22.816V23.584C98.8888 24.5227 99.0914 25.3547 99.4968 26.08C99.9234 26.784 100.51 27.328 101.257 27.712C102.025 28.0747 102.921 28.256 103.945 28.256C104.862 28.256 105.662 28.1173 106.345 27.84C107.049 27.5627 107.689 27.1467 108.265 26.592L110.921 29.472C110.131 30.368 109.139 31.0613 107.945 31.552C106.75 32.0213 105.374 32.256 103.817 32.256ZM121.252 32.256C119.78 32.256 118.362 32.0853 116.996 31.744C115.652 31.3813 114.586 30.9333 113.796 30.4L115.46 26.816C116.25 27.3067 117.178 27.712 118.244 28.032C119.332 28.3307 120.399 28.48 121.444 28.48C122.596 28.48 123.407 28.3413 123.876 28.064C124.367 27.7867 124.612 27.4027 124.612 26.912C124.612 26.5067 124.42 26.208 124.036 26.016C123.674 25.8027 123.183 25.6427 122.564 25.536C121.946 25.4293 121.263 25.3227 120.516 25.216C119.791 25.1093 119.055 24.9707 118.308 24.8C117.562 24.608 116.879 24.3307 116.26 23.968C115.642 23.6053 115.14 23.1147 114.756 22.496C114.394 21.8773 114.212 21.0773 114.212 20.096C114.212 19.008 114.522 18.048 115.14 17.216C115.78 16.384 116.698 15.7333 117.892 15.264C119.087 14.7733 120.516 14.528 122.18 14.528C123.354 14.528 124.548 14.656 125.764 14.912C126.98 15.168 127.994 15.5413 128.804 16.032L127.14 19.584C126.308 19.0933 125.466 18.7627 124.612 18.592C123.78 18.4 122.97 18.304 122.18 18.304C121.071 18.304 120.26 18.4533 119.748 18.752C119.236 19.0507 118.98 19.4347 118.98 19.904C118.98 20.3307 119.162 20.6507 119.524 20.864C119.908 21.0773 120.41 21.248 121.028 21.376C121.647 21.504 122.319 21.6213 123.044 21.728C123.791 21.8133 124.538 21.952 125.284 22.144C126.031 22.336 126.703 22.6133 127.3 22.976C127.919 23.3173 128.42 23.7973 128.804 24.416C129.188 25.0133 129.38 25.8027 129.38 26.784C129.38 27.8507 129.06 28.8 128.42 29.632C127.78 30.4427 126.852 31.0827 125.636 31.552C124.442 32.0213 122.98 32.256 121.252 32.256ZM139.5 32.256C137.474 32.256 135.895 31.744 134.764 30.72C133.634 29.6747 133.068 28.128 133.068 26.08V10.976H138.06V26.016C138.06 26.7413 138.252 27.3067 138.636 27.712C139.02 28.096 139.543 28.288 140.204 28.288C140.994 28.288 141.666 28.0747 142.22 27.648L143.564 31.168C143.052 31.5307 142.434 31.808 141.708 32C141.004 32.1707 140.268 32.256 139.5 32.256ZM130.412 19.008V15.168H142.348V19.008H130.412Z" />

      <path d="M21.7161 0.844C21.5051 0.333 21.0051 0 20.4491 0C19.8931 0 19.3921 0.334 19.1821 0.844L15.9201 8.784L7.74806 6.099C7.24906 5.935 6.69806 6.069 6.33206 6.445C5.96706 6.82 5.85206 7.371 6.03606 7.86L9.04306 15.832L0.833056 19.282C0.324056 19.495 -0.0049438 19.993 5.62025e-05 20.541C0.0050562 21.09 0.343056 21.582 0.855056 21.786L8.90206 25.007L5.83306 33.06C5.64506 33.552 5.76206 34.108 6.13306 34.484C6.50406 34.861 7.06106 34.991 7.56306 34.818L15.8651 31.952L19.1791 40.141C19.3881 40.655 19.8911 40.992 20.4491 40.992C21.0081 40.992 21.5101 40.655 21.7191 40.141L25.0741 31.85L33.5341 34.816C34.0361 34.992 34.5951 34.863 34.9681 34.487C35.3401 34.11 35.4581 33.553 35.2701 33.06L32.1741 24.936L40.0431 21.786C40.5551 21.582 40.8931 21.09 40.8981 20.541C40.9031 19.993 40.5731 19.495 40.0651 19.282L32.0321 15.906L35.0671 7.86C35.2511 7.371 35.1361 6.821 34.7721 6.446C34.4061 6.07 33.8561 5.935 33.3571 6.098L24.9971 8.83L21.7161 0.844ZM26.0311 11.346L27.0431 13.809L29.5111 14.847L31.5061 9.557L26.0311 11.346ZM29.6371 25.951L27.0411 26.99L26.0931 29.333L31.6711 31.288L29.6371 25.951ZM14.8461 29.434L13.8571 26.99L11.4391 26.023L9.42606 31.305L14.8461 29.434ZM11.5641 14.772L13.8551 13.809L14.8861 11.299L9.59906 9.562L11.5641 14.772ZM16.1761 15.349L20.4491 4.949L24.7221 15.349C24.8581 15.681 25.1221 15.946 25.4541 16.086L35.9551 20.499L25.4761 24.694C25.1311 24.831 24.8581 25.103 24.7191 25.446L20.4491 35.996L16.1791 25.446C16.0401 25.103 15.7671 24.831 15.4221 24.694L4.94306 20.499L15.4431 16.086C15.7761 15.946 16.0391 15.681 16.1761 15.349Z" />
    </svg>
  );
}
