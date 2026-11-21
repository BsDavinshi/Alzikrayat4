import { useEffect, useState } from 'react';
import { apiRequest } from '../utils/api';

function About() {
  const [statistics, setStatistics] = useState({
    members: 0,
    photos: 0,
    comments: 0,
    albums: 0
  });

  useEffect(() => {
    apiRequest('/home')
      .then((data) => {
        if (data.statistics) setStatistics(data.statistics);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="container py-5">
      <div className="row g-5 align-items-start">
        <div className="col-lg-7">
          <span className="eyebrow">About Us</span>
          <h1 className="display-font display-5 mt-2">The story behind Alzikrayat</h1>
          <p className="lead mt-3">
            <em>Alzikrayat</em> (الذكريات) means <strong>“memories”</strong> in Arabic. The project started from a simple
            observation: our best photos are scattered across phones and chat groups, and the stories behind them
            fade quickly. Alzikrayat gives every photo a home, a title, a story and a place for friends to gather around it.
          </p>
          <p>
            Originally built in plain PHP MVC for Course Project 1, this edition modernizes Alzikrayat onto the{' '}
            <strong>MERN stack</strong> (MongoDB, Express.js, React.js with Vite, and Node.js) for the{' '}
            <em>Advanced Web Technologies</em> course at the College of Computer Science and Information Technology,
            Sudan University of Science and Technology.
          </p>

          <h2 className="h4 mt-5 mb-3">How it is built</h2>
          <div className="row g-3">
            <div className="col-sm-4">
              <div className="tier-card h-100">
                <span className="tier-label">Presentation tier</span>
                <p className="small mb-0">
                  React.js (Vite), React Router, Bootstrap 5, Canvas pixel filter studio and async REST calls.
                </p>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="tier-card h-100">
                <span className="tier-label">Application tier</span>
                <p className="small mb-0">
                  Express.js REST API, hand-written routes &amp; controllers, Joi validation, bcrypt and Multer uploads.
                </p>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="tier-card h-100">
                <span className="tier-label">Data tier</span>
                <p className="small mb-0">
                  MongoDB with Mongoose ODM schemas for Users, Photos, Comments and Albums.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card about-card">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Alzikrayat in numbers</h2>
              <ul className="list-unstyled about-numbers mb-4">
                <li>
                  <span>{Number(statistics.members).toLocaleString()}</span> members
                </li>
                <li>
                  <span>{Number(statistics.photos).toLocaleString()}</span> memories shared
                </li>
                <li>
                  <span>{Number(statistics.comments).toLocaleString()}</span> comments written
                </li>
                <li>
                  <span>{Number(statistics.albums).toLocaleString()}</span> albums curated
                </li>
              </ul>
              <h2 className="h6">Our values</h2>
              <ul className="small mb-0">
                <li>
                  <strong>Privacy first</strong> — bcrypt-hashed passwords, server-side validation and safe output.
                </li>
                <li>
                  <strong>Ownership</strong> — only you can delete your photos and albums.
                </li>
                <li>
                  <strong>Accessibility</strong> — responsive on phones, tablets and desktops, with a dark mode.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
