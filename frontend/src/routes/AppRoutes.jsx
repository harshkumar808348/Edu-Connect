import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TeacherLogin from '../LoginPannel/TeacherLogin';
import StudentLogin from '../LoginPannel/StudentLogin';
import TeacherRegister from '../LoginPannel/TeacherRegister';
import StudentRegister from '../LoginPannel/StudentRegister';
import CreateClassroom from '../TeacherDashboard/CreateClassroom';
import JoinClassroom from '../StudentDashboard/JoinClassroom';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, allowedTypes }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }

  if (allowedTypes && !allowedTypes.includes(user.type)) {
    return <Navigate to="/" />;
  }

  return children;
};

const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
    {/* Hero Section */}
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Modern Education</span>{' '}
                <span className="block text-indigo-600 xl:inline">Made Simple</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Connect, collaborate, and learn in a digital classroom environment designed for today's educational needs.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/student/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Student Portal
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/teacher/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                  >
                    Teacher Portal
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
          alt="Education"
        />
      </div>
    </div>

    {/* Stats Section */}
    <div className="bg-indigo-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Trusted by educators and students worldwide
          </h2>
          <p className="mt-3 text-xl text-indigo-200 sm:mt-4">
            Join thousands of institutions already using our platform
          </p>
        </div>
        <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
          <div className="flex flex-col">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
              Active Users
            </dt>
            <dd className="order-1 text-5xl font-extrabold text-white">100K+</dd>
          </div>
          <div className="flex flex-col mt-10 sm:mt-0">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
              Virtual Classrooms
            </dt>
            <dd className="order-1 text-5xl font-extrabold text-white">50K+</dd>
          </div>
          <div className="flex flex-col mt-10 sm:mt-0">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-indigo-200">
              Countries
            </dt>
            <dd className="order-1 text-5xl font-extrabold text-white">100+</dd>
          </div>
        </dl>
      </div>
    </div>

    {/* Features Section */}
    <div className="py-16 bg-white overflow-hidden lg:py-24">
      <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
        <div className="relative">
          <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to manage education
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
            Everything you need to run your educational institution efficiently, all in one place.
          </p>
        </div>

        <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div className="relative">
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
              For Teachers
            </h3>
            <p className="mt-3 text-lg text-gray-500">
              Empower your teaching with powerful tools and features designed to make your job easier.
            </p>

            <dl className="mt-10 space-y-10">
              {[
                {
                  name: 'Easy Assignment Management',
                  description: 'Create, distribute, and grade assignments with our intuitive interface.',
                  icon: '📝'
                },
                {
                  name: 'Real-time Student Interaction',
                  description: 'Engage with students through live chat and interactive whiteboards.',
                  icon: '💬'
                },
                {
                  name: 'Automated Grading',
                  description: 'Save time with automatic grading and plagiarism detection.',
                  icon: '✅'
                }
              ].map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10 -mx-4 relative lg:mt-0">
            <img
              className="relative mx-auto rounded-lg shadow-lg"
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
              alt="Teacher Dashboard"
            />
          </div>
        </div>

        <div className="relative mt-12 sm:mt-16 lg:mt-24">
          <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="lg:col-start-2">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                For Students
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Access all your educational resources and collaborate with peers in one platform.
              </p>

              <dl className="mt-10 space-y-10">
                {[
                  {
                    name: 'Organized Learning',
                    description: 'Keep track of assignments, deadlines, and materials in one place.',
                    icon: '📚'
                  },
                  {
                    name: 'Interactive Learning',
                    description: 'Participate in discussions and collaborative activities.',
                    icon: '🤝'
                  },
                  {
                    name: 'Progress Tracking',
                    description: 'Monitor your academic progress with detailed analytics.',
                    icon: '📊'
                  }
                ].map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        <span className="text-2xl">{feature.icon}</span>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10 -mx-4 relative lg:mt-0 lg:col-start-1">
              <img
                className="relative mx-auto rounded-lg shadow-lg"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80"
                alt="Student Dashboard"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Testimonials Section */}
    <div className="bg-gray-50 pt-16 lg:py-24">
      <div className="pb-16 bg-indigo-600 lg:pb-0 lg:z-10 lg:relative">
        <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="relative lg:-my-8">
            <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:p-0 lg:h-full">
              <div className="aspect-w-10 aspect-h-6 rounded-xl shadow-xl overflow-hidden sm:aspect-w-16 sm:aspect-h-7 lg:aspect-none lg:h-full">
                <img
                  className="object-cover lg:h-full lg:w-full"
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80"
                  alt="Testimonials"
                />
              </div>
            </div>
          </div>
          <div className="mt-12 lg:m-0 lg:col-span-2 lg:pl-8">
            <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:px-0 lg:py-20 lg:max-w-none">
              <blockquote>
                <div>
                  <svg
                    className="h-12 w-12 text-white opacity-25"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="mt-6 text-2xl font-medium text-white">
                    This platform has revolutionized how we manage our educational institution. The ease of use and comprehensive features have made a significant impact on both our teachers and students.
                  </p>
                </div>
                <footer className="mt-6">
                  <p className="text-base font-medium text-white">Dr. Sarah Mitchell</p>
                  <p className="text-base font-medium text-indigo-100">Principal, International Academy</p>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Pricing Section */}
    <div className="bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for your institution
          </p>
        </div>
        <div className="mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 sm:gap-y-0 sm:gap-x-8 lg:max-w-4xl lg:grid-cols-3 lg:mx-auto">
          {/* Free Tier */}
          <div className="flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-gray-200 hover:scale-105 transition-transform duration-300">
            <div className="p-8 sm:p-10">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">Starter</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold tracking-tight text-gray-900">
                <span>$0</span>
                <span className="text-lg font-semibold leading-8 tracking-normal text-gray-500">/mo</span>
              </div>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Perfect for small classes and getting started
              </p>
            </div>
            <div className="flex flex-1 flex-col p-2">
              <div className="flex flex-1 flex-col justify-between rounded-2xl bg-gray-50 p-6 sm:p-8">
                <ul role="list" className="space-y-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">Up to 100 students</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">Basic features included</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">Community support</p>
                  </li>
                </ul>
                <Link
                  to="/teacher/register"
                  className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started today
                </Link>
              </div>
            </div>
          </div>

          {/* Growth Tier */}
          <div className="flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-gray-200 hover:scale-105 transition-transform duration-300">
            <div className="p-8 sm:p-10">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">Growth</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold tracking-tight text-gray-900">
                <span>$2</span>
                <span className="text-lg font-semibold leading-8 tracking-normal text-gray-500">/mo per student</span>
              </div>
              <p className="mt-6 text-base leading-7 text-gray-600">
                For growing institutions with more needs
              </p>
            </div>
            <div className="flex flex-1 flex-col p-2">
              <div className="flex flex-1 flex-col justify-between rounded-2xl bg-gray-50 p-6 sm:p-8">
                <ul role="list" className="space-y-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">100-500 students</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">Advanced features included</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">Priority email support</p>
                  </li>
                </ul>
                <Link
                  to="/teacher/register"
                  className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Start growing
                </Link>
              </div>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-gray-200 hover:scale-105 transition-transform duration-300">
            <div className="p-8 sm:p-10">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">Enterprise</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold tracking-tight text-gray-900">
                <span>$4</span>
                <span className="text-lg font-semibold leading-8 tracking-normal text-gray-500">/mo per student</span>
              </div>
              <p className="mt-6 text-base leading-7 text-gray-600">
                For large institutions requiring custom solutions
              </p>
            </div>
            <div className="flex flex-1 flex-col p-2">
              <div className="flex flex-1 flex-col justify-between rounded-2xl bg-gray-50 p-6 sm:p-8">
                <ul role="list" className="space-y-6">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">500-2000 students</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">All premium features</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm leading-6 text-gray-600">24/7 dedicated support</p>
                  </li>
                </ul>
                <a
                  href="mailto:harshkumarconnect@gmail.com?subject=Enterprise%20Plan%20Inquiry"
                  className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Contact sales
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          Need more than 2000 students? <a href="mailto:harshkumarconnect@gmail.com" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Contact us</a> for custom enterprise pricing.
        </p>
      </div>
    </div>

    {/* CTA Section */}
    <div className="bg-white">
      <div className="max-w-7xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-black sm:text-4xl">
          <span className="block">Ready to get started?</span>
          <span className="block text-indigo-600">Join our platform today.</span>
        </h2>
        <div className="mt-8 flex justify-center gap-x-4">
          <Link
            to="/student/register"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Register as Student
          </Link>
          <Link
            to="/teacher/register"
            className="inline-flex items-center justify-center px-5 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
          >
            Register as Teacher
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
              <span className="font-bold text-xl text-gray-800">EduConnect</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <div className="flex items-center space-x-2">
                {/* Student Dropdown */}
                <div className="relative group">
                  <button className="px-4 py-2 text-gray-700 group-hover:text-indigo-600 focus:outline-none flex items-center space-x-1">
                    <span>Student</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/student/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      Login
                    </Link>
                    <Link to="/student/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      Register
                    </Link>
                  </div>
                </div>

                {/* Teacher Dropdown */}
                <div className="relative group">
                  <button className="px-4 py-2 text-gray-700 group-hover:text-indigo-600 focus:outline-none flex items-center space-x-1">
                    <span>Teacher</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/teacher/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      Login
                    </Link>
                    <Link to="/teacher/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="mobile-menu-button p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {!user ? (
            <>
              <Link to="/student/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Student Login
              </Link>
              <Link to="/student/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Student Register
              </Link>
              <Link to="/teacher/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Teacher Login
              </Link>
              <Link to="/teacher/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Teacher Register
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setPageLoading(false);
    }
  }, [loading]);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={
            user ? (
              <Navigate to={user.type === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} />
            ) : (
              <LandingPage />
            )
          } />
          <Route path="/teacher/login" element={
            user?.type === 'teacher' ? <Navigate to="/teacher/dashboard" /> : <TeacherLogin />
          } />
          <Route path="/student/login" element={
            user?.type === 'student' ? <Navigate to="/student/dashboard" /> : <StudentLogin />
          } />
          <Route path="/teacher/register" element={<TeacherRegister />} />
          <Route path="/student/register" element={<StudentRegister />} />

          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedTypes={['teacher']}>
              <CreateClassroom />
            </ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedTypes={['student']}>
              <JoinClassroom />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default AppRoutes; 