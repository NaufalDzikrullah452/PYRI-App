import React from 'react'
import { Doughnut, defaults } from 'react-chartjs-2'

export default (x) => {
    const idata = x.data;
    return (
        <div>
            <Doughnut
                data={{
                    labels: [
                        'Premium',
                        'Non-Premium'
                    ],
                    datasets: [{
                        label: '# of Votes',
                        data: [40, 60],
                        backgroundColor: [
                            '#f0932b',
                            '#dcdde1',
                        ],
                        hoverOffset: 4
                    }]
                }}
            />
        </div>
    )
}
