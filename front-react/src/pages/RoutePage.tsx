import React from 'react';
import axios from 'axios';
import { Route } from '../models';
import './Route.css';

type Props = {};
const API_URL = process.env.REACT_APP_API_URL as string || 'http://localhost:3000';
export const RoutePage = (props: Props) => {
    const [page, setPage] = React.useState<Route[] | null>(null);
    const currentPage = 1;

    React.useEffect(() => {
        (async () => {
            const { data: page } = await axios.get(`${API_URL}/routes`);
            setPage(page);
            console.log(page);
        })();
    }, [currentPage]);

    const showRoutes = (page : Route[]) => {
        return <div>
            <h1 >Routes </h1>
            <table className="tableRoute" >
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Start Position (Lat/Lon)</th>
                        <th>End Position (Lat/Lon)</th>
                    </tr>
                </thead>
                <tbody>
                    {page.map((route, key) => (
                        <tr>
                            <td>{route.title}</td>
                            <td>{route.startPosition.lat} / {route.startPosition.lng}</td>
                            <td>{route.endPosition.lat} / {route.endPosition.lng}</td>
                        </tr>
                    )
                    )}
                </tbody>
            </table>
        </div>
    }

    const showEmpty = () => {
        return (
            <div>No Routes</div>
        )
    }

    return (
        page ? showRoutes(page) : showEmpty()
    )
}