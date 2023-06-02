@echo off

cd google-clone/
call yarn build
cd ..

call cargo run
