import React from 'react'
import { Bar, defaults } from 'react-chartjs-2'

const BarChart = () => {
    return (
        <div>
            <Bar
                options={{
                    responsive: true,
                    maintainAspectRatio: true,
                }}
                data={{
                    labels: ['Author 1', 'Author 2', 'Author 3', 'Author 3', 'Author 4', 'Author 5', 'Author 6', 'Author 7', 'Author 8', 'Author 9', 'Author 10', 'Author 11', 'Author 12'],
                    datasets: [
                        {
                            label: '# of Votes',
                            data: [120, 19, 3, 5, 2, 3, 10, 10, 20, 70, 67, 8],
                            backgroundColor: '#00cec9',
                            borderRadius: 0,
                        },
                    ],
                }}
            />
        </div>
    )
}

export default BarChart