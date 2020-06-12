import React from 'react';

const inject = obj => Comp => props => <Comp {...obj}{...props}/>;

function parse_qs(qs, re=/(\w+)=([^&]+)/) {
    let qsobj = {};

    if (qs.startsWith('?')) {
        qs = qs.substr(1);
    }

    qs.split('&').forEach(element => {
        let match = re.exec(element);
        if (match) {
            qsobj[match[1]] = match[2];
        }
    });
    return qsobj;
}

export { inject, parse_qs };