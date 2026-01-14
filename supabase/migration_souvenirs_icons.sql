-- Remove image_url and add icon/color columns
alter table souvenirs drop column if exists image_url;
alter table souvenirs add column if not exists icon text default 'Gift';
alter table souvenirs add column if not exists color text default 'blue';
