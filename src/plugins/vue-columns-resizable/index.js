export default ({ Vue }) => {
    Vue.directive('columns-resizable', {
        inserted (el, binding) {
            if (el.nodeName !== 'TABLE') { return console.error('This directive is only valid on a table!'); }

            const opt = binding.value || {};
            const table = el;
            const thead = table.querySelector('thead');
            const ths = thead.querySelectorAll('th');
            const calcTableWidth = () => {
                let tableWidth = 0;
                let width = 0;

                ths.forEach((th) => {
                    if (th.style.width) {
                        width = Number(parseInt(th.style.width));
                    } else {
                        width = th.offsetWidth;
                    }
                    tableWidth += width;
                }, 0);

                return tableWidth;
            };
            const applyTableWidth = () => {
                if (opt.fixedWidthTable) {
                    table.style.width = calcTableWidth();
                    table.style.maxWidth = 'none';
                } else if (!table.style.width) {
                    table.style.width = '100%';
                    table.style.maxWidth = '100%';
                }
            };
            const handleResize = e => {
                if (opt.resizable === false) return;

                if (!opt.fixedWidthTable) {
                    activeTh.style.width = parseInt(activeTh.style.width) + e.movementX + 'px';
                    neighbourghTh.style.width = parseInt(neighbourghTh.style.width) - e.movementX + 'px';
                } else {
                    activeTh.style.width = parseInt(activeTh.style.width) + e.movementX + 'px';
                    table.style.width = parseInt(table.style.width) + e.movementX + 'px';
                }
            };

            let activeTh = null; // the th being resized
            let neighbourghTh = null; // the next except when the last column is being resized in that case it is the previous
            let resizing = false; // a resize started needed because we can not detect event handler was attached or not
            table.style.position = 'relative';

            applyTableWidth();

            ths.forEach((th, index) => {
                // initilise the width if th does not already have it
                if (!th.style.width) {
                    th.style.width = th.offsetWidth + 'px';
                }

                th.originalWidth = th.style.width;
                const bar = document.createElement('div');

                bar.style.position = 'absolute';
                bar.style.right = 0;
                bar.style.top = 0;
                bar.style.bottom = 0;
                bar.style.cursor = 'col-resize';

                // customisable options
                bar.style.width = opt.handleWidth || '8px';
                bar.style.zIndex = opt.zIndex || 1;
                bar.className = opt.handleClass || 'columns-resize-bar';

                bar.addEventListener('mousedown', (e) => {
                    // element with a fixedsize attribute will be ignored
                    if (e.target.parentElement.getAttribute('fixedsize')) {
                        return;
                    }
                    resizing = true;
                    document.body.addEventListener('mousemove', handleResize);
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';

                    activeTh = e.target.parentElement;
                    neighbourghTh = activeTh.nextElementSibling;
                    if (!neighbourghTh) {
                        neighbourghTh = activeTh.previousElementSibling;
                    }

                    // calculate table size if the table width is fixed
                    if (!opt.fixedWidthTable) {
                        let tableWidth = ths.reduce((a, th) => {
                            return a + Number(parseInt(th.style.width));
                        }, 0);
                        table.style.width = tableWidth + 'px';
                    }
                });

                th.appendChild(bar);
            });

            document.addEventListener('mouseup', () => {
                if (!resizing) return;
                resizing = false;
                document.body.removeEventListener('mousemove', handleResize);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                if (typeof opt.afterResize === 'function') {
                    opt.afterResize(ths);
                }
            });

            // resets the column sizes
            el.$resetColumnSizes = () => {
                ths.forEach((th) => {
                    th.style.width = th.originalWidth;
                }, 0);
                applyTableWidth();
            };
        }
    });
};
