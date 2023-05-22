import React from 'npm:react';
import { renderToStaticMarkup } from 'npm:react-dom/server';

interface HomeProps { name: string }

const Home = ({ name }: HomeProps) => {
    return <div>Hello {name}!</div>
}

export const HomePage = ({ name }: HomeProps) => renderToStaticMarkup(<Home name={name} />)