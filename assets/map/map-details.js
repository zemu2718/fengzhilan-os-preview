// 所有坐标均按 900 × 506.5 的中间构图。球纹、近云取自同一张地图；货箱是单独出的高清图（IMG-MAP-PARCEL，256 宽）。
(() => {
  const stage = document.querySelector('[data-flow-stage]');
  if (location.hash.includes('still')) stage.dataset.still = '';
  const anchor = stage.querySelector('.patch') || stage.querySelector('img');
  anchor.insertAdjacentHTML('afterend', `
    <svg class="map-details overlay-box" viewBox="0 0 900 506.5" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <image id="map-artwork" href="img/map/MAP-无轨.jpg" width="900" height="506.5" preserveAspectRatio="none"/>
        <radialGradient id="detail-feather">
          <stop offset=".48" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/>
        </radialGradient>
        <mask id="sphere-interior" maskUnits="userSpaceOnUse" x="437" y="150" width="55" height="55">
          <ellipse cx="463" cy="176" rx="26" ry="23" fill="url(#detail-feather)"/>
        </mask>
        <mask id="near-cloud-bank" maskUnits="userSpaceOnUse" x="290" y="390" width="604" height="116.5">
          <ellipse cx="456" cy="463" rx="137" ry="57" fill="url(#detail-feather)"/>
          <ellipse cx="817" cy="457" rx="72" ry="46" fill="url(#detail-feather)"/>
        </mask>
        <g id="parcel-art">
          <ellipse cx=".5" rx="8.3" ry="1.7" fill="#50311a" opacity=".42"/>
          <image href="img/map/parcel.webp" x="-8" y="-12.8" width="16" height="13.2"/>
        </g>
        <path id="belt-route" d="M214 303 C194 308 163 319 140 326 C118 332 109 337 117 345 C127 355 157 357 184 363 C213 368 231 371 238 383"/>
      </defs>
      <g mask="url(#near-cloud-bank)"><use class="near-clouds" href="#map-artwork"/></g>
      <g mask="url(#sphere-interior)">
        <use class="sphere-grain" href="#map-artwork"/>
        <ellipse class="sphere-glint" cx="464" cy="173" rx="8" ry="16" fill="url(#detail-feather)"/>
      </g>
      ${Array.from({length: 5}, () => '<use class="shipment" href="#parcel-art"/>').join('')}
    </svg>`);
})();
